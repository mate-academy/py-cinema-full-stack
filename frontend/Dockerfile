FROM node:current-alpine3.23

WORKDIR /web


COPY frontend/package.json package.json

RUN npm install

COPY frontend/ .

RUN adduser \
    --disabled-password \
    --no-create-home \
    npm-user


RUN chown -R npm-user:npm-user /web/node_modules
RUN chmod -R 755  /web/node_modules


USER npm-user
