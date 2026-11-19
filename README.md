# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

## Run locally

1. Copy `.env.sample` to `.env`, then start the backend, database, and frontend:

   ```sh
   docker compose up --build -d
   docker compose cp sample_cinema.json app:/tmp/sample_cinema.json
   docker compose exec app python manage.py loaddata /tmp/sample_cinema.json
   ```

2. Open `http://127.0.0.1:5173`. The Vite dev server proxies `/api` and `/media` requests to Django.
