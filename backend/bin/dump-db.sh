#!/bin/bash
# Helper script to dump the MariaDB database from Docker container to docs/migration/airlink_schema.sql

# Source .env file if it exists to get DB configuration
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_USER=${DB_USERNAME:-airlink}
DB_NAME=${DB_DATABASE:-airlink}

echo "Dumping database '${DB_NAME}' from container..."
# Use root user inside container to perform full dump
docker compose exec -T db mysqldump -u root -p"admin@123" "${DB_NAME}" > docs/migration/airlink_schema.sql

echo "Database dump saved to docs/migration/airlink_schema.sql"
