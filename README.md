# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

---

## Docker (development)

Quick start:

1. Copy environment variables from `.env.sample` to `.env` and set any values you want.
2. Build and run services:

   ```
   docker compose up --build
   ```

- Frontend will be available at: http://localhost:3000
- Backend API will be available at: http://localhost:8080

Notes:
- The frontend container serves the built static files with `nginx` and proxies `/api/` to the `app` service (Django), so no CORS setup is required.
- The backend runs migrations on startup (see `docker-compose.yml`).

Tip: If you want to build the frontend with a different API URL, you can pass build args manually:

```bash
docker compose build --build-arg VITE_API_URL="http://localhost:8080" frontend
```
