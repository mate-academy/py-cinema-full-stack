# Użyj Node jako bazy (dla React/Vite)
FROM node:18-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package.json i zainstaluj zależności
COPY package*.json ./
RUN npm install

# Skopiuj cały kod frontendu
COPY . .

# Otwórz port 5173 (Vite dev server)
EXPOSE 5173

# Uruchom serwer developerski
CMD ["npm", "run", "dev"]