# Development image
FROM node:lts-alpine

WORKDIR /usr/src/app

# Copy package.json first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host"]