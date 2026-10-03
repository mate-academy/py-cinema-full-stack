FROM node:26-alpine

EXPOSE 5173

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN adduser --disabled-password --no-create-home frontend-user --gecos "" && \
    chown -R frontend-user:frontend-user /app && \
    chmod -R 755 /app

USER frontend-user
