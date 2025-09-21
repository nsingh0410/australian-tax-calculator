#!/bin/sh
set -e

echo "Waiting for MySQL to be ready..."

# Wait for MySQL to be ready
until mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
    echo "MySQL is unavailable - sleeping"
    sleep 2
done

echo "MySQL is up - executing command"

# Run database setup if needed
if [ "$1" = "setup" ]; then
    npm run db:setup
    npm run db:seed
    exit 0
fi

# Execute the main command
exec "$@"