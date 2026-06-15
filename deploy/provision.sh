#!/usr/bin/env bash
#
# Airlink VPS provisioning — Ubuntu 22.04 / 24.04 LTS
# Installs the full stack: PHP 8.3, Composer, Node 20, MariaDB, Nginx, Redis,
# Supervisor, FreeRADIUS (+ MySQL module), Certbot.
#
# Usage (as root or with sudo):
#   chmod +x provision.sh && sudo ./provision.sh
#
# Idempotent: safe to re-run. Review the CONFIG block before running.
set -euo pipefail

# ---------------------------------------------------------------- CONFIG ----
APP_DIR="/var/www/airlink"
APP_DB="airlink"
APP_DB_USER="airlink"
APP_DB_PASS="change-me-app"          # <-- change
RADIUS_DB_USER="radius"
RADIUS_DB_PASS="change-me-radius"    # <-- change
PHP_VER="8.3"
NODE_MAJOR="20"
# ----------------------------------------------------------------------------

log() { echo -e "\n\033[1;34m==> $*\033[0m"; }

log "Updating base system"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get upgrade -y
apt-get install -y software-properties-common curl git unzip ufw

log "Installing PHP ${PHP_VER} + extensions"
add-apt-repository -y ppa:ondrej/php
apt-get update -y
apt-get install -y \
  php${PHP_VER}-cli php${PHP_VER}-fpm php${PHP_VER}-mysql php${PHP_VER}-mbstring \
  php${PHP_VER}-xml php${PHP_VER}-curl php${PHP_VER}-gd php${PHP_VER}-bcmath \
  php${PHP_VER}-zip php${PHP_VER}-intl php${PHP_VER}-redis

log "Installing Composer"
if ! command -v composer >/dev/null; then
  curl -sS https://getcomposer.org/installer | php
  mv composer.phar /usr/local/bin/composer
fi

log "Installing Node ${NODE_MAJOR} LTS"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
  apt-get install -y nodejs
fi

log "Installing MariaDB"
apt-get install -y mariadb-server
systemctl enable --now mariadb

log "Creating databases + users"
mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${APP_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${APP_DB_USER}'@'localhost' IDENTIFIED BY '${APP_DB_PASS}';
GRANT ALL PRIVILEGES ON \`${APP_DB}\`.* TO '${APP_DB_USER}'@'localhost';
-- FreeRADIUS reads the same DB (shared-DB model); scope it to the rad* tables.
CREATE USER IF NOT EXISTS '${RADIUS_DB_USER}'@'localhost' IDENTIFIED BY '${RADIUS_DB_PASS}';
GRANT SELECT, INSERT, UPDATE, DELETE ON \`${APP_DB}\`.* TO '${RADIUS_DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log "Installing Nginx"
apt-get install -y nginx
systemctl enable --now nginx

log "Installing Redis + Supervisor"
apt-get install -y redis-server supervisor
systemctl enable --now redis-server

log "Installing FreeRADIUS (+ MySQL module + utils)"
apt-get install -y freeradius freeradius-mysql freeradius-utils
systemctl stop freeradius || true
# Import the FreeRADIUS schema into the app DB (idempotent: IF NOT EXISTS in schema).
RAD_SCHEMA="/etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql"
if [ -f "$RAD_SCHEMA" ]; then
  mysql "${APP_DB}" < "$RAD_SCHEMA" || true
fi
# Enable the SQL module.
ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql

log "Installing Certbot (run certbot --nginx manually once DNS points here)"
apt-get install -y certbot python3-certbot-nginx

log "Firewall (UFW)"
ufw allow 22/tcp
ufw allow 80,443/tcp
ufw allow 1812,1813/udp        # RADIUS auth + accounting (restrict to NAS IPs in production)
ufw --force enable

cat <<NEXT

============================================================================
 Base stack installed. Manual steps remaining:

 1. Deploy the app:
      git clone <your-repo> ${APP_DIR}
      cd ${APP_DIR} && composer install --no-dev -o && npm ci && npm run build
      cp .env.example .env   # then edit (see deploy/.env.production.example)
      php artisan key:generate
      php artisan migrate --force --seed
      # import production data:
      mysql ${APP_DB} < /path/to/airlink_full.sql   (or: php artisan airlink:migrate-legacy)
      php artisan storage:link
      php artisan config:cache route:cache view:cache

 2. Nginx:   cp deploy/nginx/airlink.conf /etc/nginx/sites-available/airlink
             ln -s /etc/nginx/sites-available/airlink /etc/nginx/sites-enabled/
             nginx -t && systemctl reload nginx
             certbot --nginx -d your.domain

 3. FreeRADIUS SQL:  edit /etc/freeradius/3.0/mods-available/sql  (see deploy/freeradius/sql.conf)
                     set dialect=mysql, server/login/password/radius_db, read_clients=yes
                     systemctl restart freeradius
                     # test:  freeradius -X   then  radtest <user> <pass> 127.0.0.1 0 <secret>

 4. Queue + scheduler:
      cp deploy/supervisor/airlink-worker.conf /etc/supervisor/conf.d/
      supervisorctl reread && supervisorctl update && supervisorctl start airlink-worker:*
      ( crontab -l 2>/dev/null; echo "* * * * * php ${APP_DIR}/artisan schedule:run >> /dev/null 2>&1" ) | crontab -

 5. Permissions:
      chown -R www-data:www-data ${APP_DIR}/storage ${APP_DIR}/bootstrap/cache
============================================================================
NEXT
log "Done."
