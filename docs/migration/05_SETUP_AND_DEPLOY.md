# Setup & Deploy

## Local development (macOS) — already working

```sh
# MySQL running locally; .env points at it (DB_DATABASE=airlink)
composer install
npm install
php artisan key:generate          # if needed
php artisan migrate:fresh --seed
php artisan airlink:migrate-legacy --fresh   # import nalrd_backup.sql data
npm run dev      # terminal 1 (Vite)
php artisan serve # terminal 2  → http://127.0.0.1:8000
```

Login: `admin` / `123456` (legacy password; auto-upgraded to bcrypt on first login).

**Importing the legacy dump locally** (MariaDB → MySQL needs two fixes):
```sh
sed -e '/sandbox mode/d' \
    -e 's/date NOT NULL DEFAULT current_timestamp()/date DEFAULT NULL/g' \
    nalrd_backup.sql | mysql -u root -p airlink_legacy
```
Set `DB_LEGACY_DATABASE=airlink_legacy` in `.env` so `airlink:migrate-legacy` can read it.

## Workflow

Build + migrate + verify **locally** → `git push` → `git pull` on the fresh VPS → deploy steps below.
The legacy `nalrd/` app is reference-only; it is not deployed.

---

## VPS runbook (Ubuntu 22.04/24.04) — you run these

> You will install FreeRADIUS + system packages on the fresh VPS. This is the reference.

**1. Base + PHP 8.3**
```sh
apt update && apt upgrade -y
apt install -y php8.3-{cli,fpm,mysql,mbstring,xml,curl,gd,bcmath,zip,intl,redis}
# Composer (global) + Node 20 LTS (NodeSource)
```
Firewall (UFW): allow 22, 80, 443; RADIUS 1812/1813 UDP from NAS IPs; RouterOS API egress 8728/8729.

**2. MariaDB**
```sh
apt install -y mariadb-server && mysql_secure_installation
# create DB `airlink` + app user; grant a `radius` user on rad* tables
```

**3. Nginx + PHP-FPM + SSL**
- server block → `public/` root, fastcgi to `php8.3-fpm.sock`
- `certbot --nginx`; force 80→443; set `APP_URL=https://…`

**4. FreeRADIUS + SQL**
```sh
apt install -y freeradius freeradius-mysql
# import /etc/freeradius/3.0/mods-config/sql/main/mysql/schema.sql into the app DB
# mods-available/sql: driver rlm_sql_mysql, dialect mysql, app DB creds, read_clients = yes
ln -s ../mods-available/sql /etc/freeradius/3.0/mods-enabled/sql
# enable sql in sites-enabled/{default,inner-tunnel}; include dictionary.mikrotik
freeradius -X            # debug; then: radtest <user> <pass> 127.0.0.1 0 <secret>
```
Manage each MikroTik as a RADIUS client via the `nas` table.

**5. MikroTik (documented)**
Enable RADIUS on Hotspot/PPPoE profiles → VPS IP + shared secret + accounting; enable the API service restricted to the VPS IP.

**6. Queue + Scheduler (replaces cron.php)**
```sh
apt install -y redis-server supervisor
# Supervisor: php artisan queue:work
# crontab: * * * * * php /var/www/airlink/artisan schedule:run
```

**7. Deploy**
```sh
git pull
composer install --no-dev -o
npm ci && npm run build
# set production .env (DB, APP_KEY, REDIS, RADIUS creds, SANCTUM_STATEFUL_DOMAINS, mail)
php artisan migrate --force --seed
# one-time production data: import nalrd_backup.sql + php artisan airlink:migrate-legacy
php artisan storage:link
php artisan config:cache route:cache view:cache
systemctl restart php8.3-fpm && supervisorctl restart all
```

**`.env` keys:** `DB_*`, `DB_LEGACY_*`, `REDIS_*`, `APP_KEY`, `APP_URL`, `SANCTUM_STATEFUL_DOMAINS`, mail, `ROUTEROS_DEFAULT_PORT` (optional).

## Smoke test
HTTPS login page loads → `radtest` authenticates a seeded user → a MikroTik does a real RADIUS auth → `php artisan schedule:run` expires a due recharge → reboot survives (`systemctl enable`).
