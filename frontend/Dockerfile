FROM node:18-alpine

WORKDIR /app

COPY cinema-shop-vue-ui/package*.json ./
RUN npm install

COPY cinema-shop-vue-ui .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
