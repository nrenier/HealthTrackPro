
#!/bin/bash
set -e

echo "Creating database schema..."

# Esegui le istruzioni SQL per creare le tabelle
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE TYPE mood AS ENUM ('sad', 'neutral', 'happy');
  CREATE TYPE flow AS ENUM ('none', 'light', 'medium', 'heavy', 'clots');
  CREATE TYPE pregnancy_test AS ENUM ('none', 'positive', 'negative', 'unclear');

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
    pain_symptoms JSONB DEFAULT '[]',
    blood_in_feces BOOLEAN DEFAULT FALSE,
    blood_in_urine BOOLEAN DEFAULT FALSE,
    pregnancy_test pregnancy_test DEFAULT 'none',
    physical_activities JSONB DEFAULT '["none"]',
    medicines JSONB DEFAULT '[]',
    visits JSONB DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS medical_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endometriosis_surgery BOOLEAN DEFAULT FALSE,
    appendectomy BOOLEAN DEFAULT FALSE,
    infertility BOOLEAN DEFAULT FALSE,
    endometrioma_pre_op_ecography BOOLEAN DEFAULT FALSE,
    endometrioma_location TEXT DEFAULT 'unilateral',
    endometrioma_max_diameter INTEGER,
    ca125_value INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
EOSQL

echo "Database schema created successfully!"
