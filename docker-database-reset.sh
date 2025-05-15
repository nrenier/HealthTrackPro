#!/bin/bash

# Rimuovi i container esistenti
echo "Arresto e rimozione dei container Docker..."
docker compose down

# Rimuovi il volume esistente
echo "Rimozione del volume di dati PostgreSQL..."
docker volume rm endodiary_postgres_data || true

# Ricrea i container (questo eseguirà anche lo script di inizializzazione)
echo "Ricreazione dei container..."
docker compose up -d

# Attendi che il database sia pronto
echo "Attesa dell'avvio del database PostgreSQL..."
sleep 10

echo "Verifica dello stato del database..."
docker compose exec postgres psql -U endouser -d endodiary -c "\dt"

echo "Completato!"
echo "Il database è stato reinizializzato con successo."