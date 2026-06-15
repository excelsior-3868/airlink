# Airlink — VPS Installation Guide

A complete, copy-paste walkthrough to install Airlink (Laravel 13 + React) **and
FreeRADIUS** on a fresh **Ubuntu 22.04 / 24.04 LTS** server.

Run everything as `root` or prefix with `sudo`. Replace placeholders in
`ALL_CAPS` (passwords, `your.domain`, repo URL) as you go.

---

## 0. Before you start

- A fresh Ubuntu VPS with a public IP and a domain pointed at it (A record).
- SSH access.
- Your app pushed to a git remote (you'll `git clone` it).
- The data dump `airlink_full.sql` (from local) copied to the server, if you want
  to import existing data. Transfer it with:
  ```sh
  scp docs/migration/airlink_full.sql root@YOUR_VPS_IP:/root/
  ```

---

## 1. Update the system

```sh
apt update && apt upgrade -y
apt install -y software-properties-common curl git unzip ufw
```

---

## 2. PHP 8.3 + extensions

```sh
add-apt-repository -y ppa:ondrej/php
apt update
apt install -y php8.3-cli php8.3-fpm php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-gd php8.3-bcmath php8.3-zip php8.3-intl php8.3-redis
php -v   # confirm 8.3
```

---

## 3. Composer

```sh
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
composer --version
```

---

## 4. Node.js 20 LTS (for building the React frontend)

```sh
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v
```

---

## 5. MariaDB (database)

```sh
apt install -y mariadb-server
systemctl enable --now mariadb
mysql_secure_installation     # set a root password, answer Y to the rest
```

Create the app database + users (FreeRADIUS shares the same DB):

```sh
mysql -u root -p <<'SQL'
CREATE DATABASE airlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'airlink'@'localhost' IDENTIFIED BY 'APP_DB_PASSWORD';
GRANT ALL PRIVILEGES ON airlink.* TO 'airlink'@'localhost';

-- FreeRADIUS user, limited to read/write the rad* tables in the same DB
CREATE USER 'radius'@'localhost' IDENTIFIED BY 'RADIUS_DB_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON airlink.* TO 'radius'@'localhost';
FLUSH PRIVILEGES;
SQL
```

---

## 6. Nginx (web server)

```sh
apt install -y nginx
systemctl enable --now nginx
```

Create the site config:

```sh
cat > /etc/nginx/sites-available/airlink <<'CONF'
server {
    listen 80;
    server_name your.domain;
    root /var/www/airlink/public;
    index index.php;
    charset utf-8;

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    location ~ /\.(?!well-known).* { deny all; }
    client_max_body_size 20M;
}
CONF

ln -s /etc/nginx/sites-available/airlink /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 7. Redis + Supervisor (queue & background jobs)

```sh
apt install -y redis-server supervisor
systemctl enable --now redis-server
```

---

## 8. Deploy the application

```sh
cd /var/www
git clone YOUR_REPO_URL airlink
cd airlink

composer install --no-dev --optimize-autoloader
npm ci
npm run build

cp .env.example .env
php artisan key:generate
```

Edit `.env` (the important keys):

```ini
APP_NAME=Airlink
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your.domain

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=airlink
DB_USERNAME=airlink
DB_PASSWORD=APP_DB_PASSWORD

CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=database

SANCTUM_STATEFUL_DOMAINS=your.domain
```

Create the schema and (optionally) import existing data:

```sh
php artisan migrate --force --seed

# OPTION A — import the full data dump you copied over:
mysql -u root -p airlink < /root/airlink_full.sql

# OPTION B — import directly from the legacy dump instead:
#   set DB_LEGACY_DATABASE in .env, load nalrd_backup.sql into it, then:
#   php artisan airlink:migrate-legacy --fresh

php artisan storage:link
php artisan config:cache && php artisan route:cache && php artisan view:cache

chown -R www-data:www-data storage bootstrap/cache
```

Visit `http://your.domain` — the login page should load. Default admin from the
seed/import: **admin / 123456** (change it immediately).

---

## 9. FreeRADIUS (authentication for MikroTik)

Install FreeRADIUS and the MySQL module:

```sh
apt install -y freeradius freeradius-mysql freeradius-utils
systemctl stop freeradius
```

**9a. Load the FreeRADIUS schema** into the app database (the `rad*` tables
already exist from the Laravel migration, so this is usually a no-op, but run it
if you started from a clean DB):

```sh
mysql -u root -p airlink < /etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql
```

**9b. Configure the SQL module** — edit `/etc/freeradius/3.0/mods-available/sql`
and set:

```
sql {
    dialect = "mysql"
    driver  = "rlm_sql_${dialect}"

    mysql {
        # leave TLS off for localhost
    }

    server   = "localhost"
    port     = 3306
    login    = "radius"
    password = "RADIUS_DB_PASSWORD"
    radius_db = "airlink"

    # load NAS clients (your MikroTik routers) from the `nas` table
    read_clients = yes
    client_table = "nas"
}
```

**9c. Enable the SQL module and use it in the sites:**

```sh
ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql
```

In both `/etc/freeradius/3.0/sites-available/default` and `.../inner-tunnel`,
make sure `sql` is uncommented in the `authorize`, `accounting`, and
`post-auth` sections (replace the default `-sql` with `sql`).

**9d. MikroTik dictionary** (for `Mikrotik-Rate-Limit` etc.) ships with
`freeradius`; confirm it's referenced (it is by default in
`/etc/freeradius/3.0/dictionary` via the freeradius dictionaries).

**9e. Add each MikroTik as a RADIUS client** — managed in the `nas` table
(because `read_clients = yes`). Insert one row per router:

```sh
mysql -u root -p airlink <<'SQL'
INSERT INTO nas (nasname, shortname, type, secret, description)
VALUES ('192.168.88.1', 'router1', 'mikrotik', 'SHARED_SECRET', 'Main NAS');
SQL
```

**9f. Test:**

```sh
freeradius -X        # run in debug mode in one terminal; watch for "ready to process requests"
# in another terminal (or after Ctrl-C and `systemctl start freeradius`):
radtest USERNAME PASSWORD 127.0.0.1 0 SHARED_SECRET
```

Then start it for real:

```sh
systemctl enable --now freeradius
```

---

## 10. Queue worker + scheduler (replaces the legacy cron.php)

**Supervisor worker** for the queue:

```sh
cat > /etc/supervisor/conf.d/airlink-worker.conf <<'CONF'
[program:airlink-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/airlink/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/airlink/storage/logs/worker.log
stopwaitsecs=3600
CONF

supervisorctl reread && supervisorctl update && supervisorctl start airlink-worker:*
```

**Scheduler** (runs `airlink:expire-recharges` every minute, etc.):

```sh
( crontab -l 2>/dev/null; echo "* * * * * php /var/www/airlink/artisan schedule:run >> /dev/null 2>&1" ) | crontab -
```

---

## 11. HTTPS (Let's Encrypt)

```sh
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your.domain
# auto-renew is installed; test with:  certbot renew --dry-run
```

After SSL, ensure `APP_URL=https://your.domain` in `.env`, then
`php artisan config:cache`.

---

## 12. Firewall

```sh
ufw allow 22/tcp
ufw allow 80,443/tcp
ufw allow from NAS_IP to any port 1812,1813 proto udp   # RADIUS, per router IP
ufw enable
```

---

## 13. MikroTik router side (on the router, not the VPS)

- **RADIUS:** `/radius add service=hotspot,ppp address=YOUR_VPS_IP secret=SHARED_SECRET`
- Enable RADIUS on the Hotspot/PPPoE server profile: `use-radius=yes` + accounting.
- **API** (only if you also use direct RouterOS provisioning): enable the `api`
  service and restrict it to the VPS IP. Add the router under **NAS ▸ Routers**
  in Airlink with its API credentials.

---

## 14. Smoke test (end to end)

1. `https://your.domain` loads the login page; log in as `admin`.
2. `radtest` against `127.0.0.1` returns **Access-Accept** for a provisioned user.
3. A real MikroTik authenticates a hotspot/PPPoE login (watch `freeradius -X`).
4. `php artisan airlink:expire-recharges --dry-run` lists due expiries.
5. Reboot the VPS — nginx, php-fpm, mariadb, redis, freeradius, supervisor, cron
   all come back (`systemctl is-enabled <svc>`).

---

## 15. Updating later (after `git push` from local)

```sh
cd /var/www/airlink
php artisan down
git pull
composer install --no-dev -o
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
supervisorctl restart airlink-worker:*
php artisan up
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| 500 + blank page | `APP_KEY` missing → `php artisan key:generate`; check `storage/logs/laravel.log` |
| 502 Bad Gateway | PHP-FPM socket path — confirm `/var/run/php/php8.3-fpm.sock`; `systemctl status php8.3-fpm` |
| Permission denied (logs/cache) | `chown -R www-data:www-data storage bootstrap/cache` |
| RADIUS rejects all | run `freeradius -X`; check SQL module creds + `read_clients`; confirm the `nas` row + matching router secret |
| `radtest` works but router fails | NAS secret mismatch, or UFW blocking 1812/1813 from the router IP |
| Assets 404 / unstyled | run `npm run build`; confirm `public/build` exists and `APP_URL` is correct |
| Scheduler not firing | confirm the crontab line; `php artisan schedule:list` |
