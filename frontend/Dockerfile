FROM node:slim


WORKDIR /app

COPY ./frontend/package.json .
RUN npm install
COPY ./frontend .
