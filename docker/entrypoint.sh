#!/bin/sh
set -e

# Copy .env if not exists
if [ ! -f /app/.env ]; then
    cp /app/.env.example /app/.env
fi

# Generate APP_KEY if missing or empty
if ! grep -q "APP_KEY=base64:" /app/.env || [ -z "$(grep APP_KEY /app/.env | cut -d= -f2)" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate --force
fi

# Wait for DB
echo "Waiting for database connection..."
until php -r "
try {
    \$db = new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
php artisan migrate --force

# Create storage link if not exists
php artisan storage:link --force || true

# Cache configs and routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Fix permissions so www-data can write to logs/cache
chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Start supervisor (runs nginx, php-fpm, queue worker, scheduler)
exec supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
