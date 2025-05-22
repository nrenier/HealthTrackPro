FROM node:20-alpine

WORKDIR /app

# Installa le dipendenze
COPY package*.json ./
RUN npm ci

# Copia i sorgenti
COPY . .

# Crea le directory necessarie
RUN mkdir -p public/images uploads && chmod 777 uploads

# Assicurati che il logo sia copiato nella directory public
RUN cp -r client/public/images public/

# Porta per l'applicazione
EXPOSE 5000

# Avvia l'applicazione
CMD ["npm", "run", "dev"]