# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

## Run locally

1. Copy `.env.sample` to `.env` and set `POSTGRES_HOST=db`. Choose values
   for `POSTGRES_DB`, `POSTGRES_USER` and `POSTGRES_PASSWORD`.
2. Start the backend and database:

   ```sh
   docker compose up --build -d
   ```

3. Copy `frontend/.env.sample` to `frontend/.env`. The API base URL is
   `http://localhost:8080` (the frontend runs on port 5173).
4. Start the frontend in a second terminal:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

Open http://localhost:5173. Register a customer through **Sign up**.
For administrative pages, create a staff account:

```sh
docker compose exec app python manage.py createsuperuser
```

Swagger: http://localhost:8080/api/doc/swagger/.

### Optional sample data

For a fresh database, load the provided fixture:

```sh
docker compose cp sample_cinema.json app:/app/sample_cinema.json
docker compose exec app python manage.py loaddata sample_cinema.json
```

The fixture includes a user record; load it before creating your own users.
It contains image paths rather than image files and a session dated 2023.
Upload posters through the movie creation page or Swagger's
`POST /api/cinema/movies/{id}/upload-image/`, and create sessions for the
selected date. Media is stored in the local `backend/media` directory.
Credentials, media and frontend build output are excluded from Git.

## Verification and screenshots

See [verification results and all frontend pages](docs/verification.md).

```sh
docker compose exec app python manage.py test
cd frontend
npm run build
npx eslint src
```
