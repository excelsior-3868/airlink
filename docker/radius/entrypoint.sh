#!/bin/bash
set -e

# Wait for DB container to be ready before starting FreeRADIUS
echo "Waiting for database connection..."
until mysqladmin ping -h "$DB_HOST" -u "$RADIUS_DB_USER" -p"$RADIUS_DB_PASS" --silent; do
    sleep 1
done
echo "Database is ready!"

# Enable SQL module link
ln -sf /etc/freeradius/3.0/mods-available/sql /etc/freeradius/3.0/mods-enabled/sql

# Configure the SQL module config file
cat <<EOF > /etc/freeradius/3.0/mods-available/sql
sql {
    dialect = "mysql"
    driver = "rlm_sql_mysql"
    server = "${DB_HOST}"
    port = ${DB_PORT:-3306}
    login = "${RADIUS_DB_USER}"
    password = "${RADIUS_DB_PASS}"
    radius_db = "${DB_DATABASE}"

    read_clients = yes
    client_table = "nas"

    # Default tables
    acct_table1 = "radacct"
    acct_table2 = "radacct"
    postauth_table = "radpostauth"
    authcheck_table = "radcheck"
    groupcheck_table = "radgroupcheck"
    authreply_table = "radreply"
    groupreply_table = "radgroupreply"
    usergroup_table = "radusergroup"
    delete_stale_sessions = yes

    pool {
        start = \${thread[pool].start_servers}
        min = \${thread[pool].min_spare_servers}
        max = \${thread[pool].max_servers}
        spare = \${thread[pool].max_spare_servers}
        uses = 0
        retry_delay = 30
        lifetime = 0
        idle_timeout = 60
        max_retries = 5
    }

    mysql {
        warnings = auto
    }

    group_attribute = "SQL-Group"
    \$INCLUDE \${modconfdir}/\${.:name}/main/\${dialect}/queries.conf
}
EOF

# Enable SQL module in default and inner-tunnel sites
sed -i 's/-sql/sql/g' /etc/freeradius/3.0/sites-available/default
sed -i 's/-sql/sql/g' /etc/freeradius/3.0/sites-available/inner-tunnel

# Start freeradius in foreground
echo "Starting FreeRADIUS..."
exec freeradius -f -xx -l stdout
