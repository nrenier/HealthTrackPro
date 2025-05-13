FROM node:20-alpine

WORKDIR /app

# Installa le dipendenze
COPY package*.json ./
RUN npm ci

# Copia i sorgenti
COPY . .

# Porta per l'applicazione
EXPOSE 5000

# Avvia l'applicazione
CMD ["npm", "run", "dev"]