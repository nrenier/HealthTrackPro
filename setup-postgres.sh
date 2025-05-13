#!/bin/bash

# Avvia i container Docker
echo "Starting Docker containers..."
docker compose up -d

# Attendi che PostgreSQL sia pronto
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Crea le tabelle nel database usando drizzle
echo "Running database migrations..."
npm run db:push

echo "Setup complete!"
echo "PostgreSQL is running on localhost:5432"
echo "PgAdmin is available at http://localhost:5050"
echo "Login to PgAdmin with:"
echo "  Email: admin@endodiary.com"
echo "  Password: admin"
echo ""
echo "To connect to the database in PgAdmin, add a new server with:"
echo "  Host: postgres"
echo "  Port: 5432"
echo "  Database: endodiary"
echo "  Username: endouser"
echo "  Password: endopass"