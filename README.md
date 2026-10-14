# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

## Run the connected app locally

The Vite development server forwards `/api` and `/media` requests to the Django
backend at `http://127.0.0.1:8080`. Set `VITE_API_PROXY_TARGET` when the local
backend uses a different address or port. For an API hosted at a different
origin, set `VITE_API_URL` in the frontend environment and configure that API to
allow requests from the frontend origin.

1. From the project root, create the local Docker environment file and start
   PostgreSQL and Django:

   ```powershell
   Copy-Item .env.sample .env
   docker compose up --build
   ```

2. In a second terminal, start the frontend:

   ```powershell
   Set-Location frontend
   if (-not (Test-Path .env)) { Copy-Item .env.sample .env }
   npm ci
   npm run dev
   ```

3. Open the URL printed by Vite (normally `http://localhost:5173`), sign up, and
   use the browser's Network panel to inspect the API requests. To exercise the
   staff-only screens, create a staff account with
   `docker compose exec app python manage.py createsuperuser`.

The values in `.env.sample` are for local development only. Replace them for any
shared or production environment.
