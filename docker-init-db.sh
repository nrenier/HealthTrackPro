#!/bin/bash
set -e

echo "Creating database schema..."

# Esegui le istruzioni SQL per creare le tabelle
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE TYPE mood AS ENUM ('sad', 'neutral', 'happy');
  CREATE TYPE flow AS ENUM ('none', 'light', 'medium', 'heavy', 'clots');

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood mood,
    flow flow,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS pain_symptoms (
    id SERIAL PRIMARY KEY,
    diary_entry_id INTEGER NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    intensity INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS blood_presence (
    id SERIAL PRIMARY KEY,
    diary_entry_id INTEGER NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
    in_feces BOOLEAN NOT NULL DEFAULT FALSE,
    in_urine BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
EOSQL

echo "Database schema created successfully!"