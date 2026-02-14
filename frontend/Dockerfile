FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Vite за замовчуванням використовує 5173
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
