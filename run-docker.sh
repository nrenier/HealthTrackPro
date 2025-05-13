#!/bin/bash

# Verifica se Docker è in esecuzione
docker info > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Errore: Docker non è in esecuzione. Avvia Docker e riprova."
  exit 1
fi

# Avvia i container
echo "Avvio dei container Docker..."
docker-compose up -d

# Attendi che il database sia pronto
echo "Attendi l'inizializzazione del database PostgreSQL..."
sleep 5

# Esegui le migrazioni del database
echo "Esecuzione delle migrazioni del database..."
docker-compose exec app npm run db:push

echo ""
echo "==============================================="
echo "EndoDiary è in esecuzione!"
echo "==============================================="
echo "- App: http://localhost:5000"
echo "- pgAdmin: http://localhost:5050"
echo "  - Email: admin@endodiary.com"
echo "  - Password: admin"
echo ""
echo "Per arrestare i container esegui: docker-compose down"
echo "Per visualizzare i log dell'app esegui: docker-compose logs -f app"