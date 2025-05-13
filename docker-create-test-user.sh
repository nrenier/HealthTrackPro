#!/bin/bash
set -e

# Hash password (equivalente a password123)
HASH_PASSWORD="8115c008fdaab4fe909d8de3246cecc7f5e4a0e56dc6d5c57220a738b0594b07.c5d4af56cde34b9b"

echo "Creazione utente di test..."

docker-compose exec postgres psql -U endouser -d endodiary <<-EOSQL
  INSERT INTO users (username, password, email, display_name)
  VALUES ('testuser', '$HASH_PASSWORD', 'test@example.com', 'Test User')
  ON CONFLICT (username) DO NOTHING;
EOSQL

echo "Utente di test creato o già esistente."
echo "Credenziali: username=testuser, password=password123"