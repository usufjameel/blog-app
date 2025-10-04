#!/bin/bash
set -e

echo "Starting backend initialization..."

# Create uploads directory
mkdir -p /app/uploads
echo "Created uploads directory"

# Wait for database to be ready
echo "Waiting for database..."
until nc -z postgres 5432; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "Database is ready"

# Run Prisma migration
echo "Running Prisma migration..."
npx prisma db push --accept-data-loss

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Backend initialization complete"

# Start the application
exec "$@"