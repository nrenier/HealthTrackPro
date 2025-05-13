# EndoDiary

Un'applicazione per il tracciamento di sintomi, flusso mestruale e livelli di dolore con particolare attenzione alla consapevolezza dell'endometriosi.

## Caratteristiche

- Autenticazione utenti (login/registrazione)
- Calendario mensile per visualizzare le registrazioni giornaliere
- Tracciamento quotidiano di umore, flusso e livelli di dolore
- Monitoraggio di dolori specifici con valutazione dell'intensità
- Registrazione della presenza di sangue nelle feci/urine
- Note giornaliere

## Requisiti tecnici

- Node.js v18+
- Docker e Docker Compose per PostgreSQL
- npm o yarn

## Configurazione con Docker

1. Clona il repository e naviga nella directory del progetto
2. Crea un file `.env` basato su `.env.example`
3. Esegui lo script di configurazione PostgreSQL:

```bash
./setup-postgres.sh
```

Questo avvierà:
- Un container PostgreSQL esposto sulla porta 5432
- Un container pgAdmin4 accessibile su http://localhost:5050
- L'applicazione EndoDiary accessibile su http://localhost:5000

### Reinizializzazione del database

Se desideri reinizializzare completamente il database eliminando tutti i dati:

```bash
./docker-database-reset.sh
```

### Creazione utente di test

Per creare un utente di test con cui effettuare il login:

```bash
./docker-create-test-user.sh
```

Questo crea un utente con le credenziali:
- Username: testuser
- Password: password123

## Avvio manuale

Se preferisci avviare i servizi manualmente:

1. Avvia i container Docker:
```bash
docker-compose up -d
```

2. Installa le dipendenze:
```bash
npm install
```

3. Esegui le migrazioni del database:
```bash
npm run db:push
```

4. Avvia l'applicazione:
```bash
npm run dev
```

## Accesso al database (pgAdmin)

- URL: http://localhost:5050
- Email: admin@endodiary.com
- Password: admin

Per configurare la connessione al server PostgreSQL in pgAdmin:
- Host: postgres (se in Docker) o localhost (se all'esterno)
- Port: 5432
- Database: endodiary
- Username: endouser
- Password: endopass