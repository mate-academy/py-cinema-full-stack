# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

## Run locally

Requirements: Docker Compose and Node.js with npm.

1. Copy `.env.sample` to `.env` and choose a local database password.
   Keep `POSTGRES_HOST=db`: Compose resolves this service name inside Docker.
2. Start PostgreSQL and Django:

   ```sh
   docker compose up --build -d --wait
   ```

   Migrations run automatically. Django waits for PostgreSQL's health check.
   API documentation: http://127.0.0.1:8080/api/doc/swagger/.
3. Optionally load the provided example catalogue (PowerShell):

   ```powershell
   Get-Content -Raw sample_cinema.json | docker compose exec -T app python manage.py loaddata --format=json -
   ```

   The sample sessions have historical dates. Add current sessions as a staff
   user to see them in the date-filtered interface.
4. Create a staff account for catalogue management:

   ```sh
   docker compose exec app python manage.py createsuperuser
   ```
5. Start the existing Vue 2 frontend:

   ```sh
   cd frontend
   npm ci
   npm run dev
   ```

   Open http://127.0.0.1:5173/. Register a customer or sign in as the
   superuser. Customers can browse/filter movies, choose a screening and
   seats, place orders, view order history, and update their profiles. Staff can
   also create actors, genres, halls, movies with posters, and screenings.

Vite forwards `/api/` and `/media/` to Django. Browser requests use the frontend
origin, including image URLs and order pagination links. Django's required
trailing slashes are included in requests. No CORS configuration is needed for
this local proxy setup. If the backend runs elsewhere, copy
`frontend/.env.sample` to `frontend/.env`, change `VITE_API_URL`, and restart Vite.
This variable configures the proxy's backend target.

`npm run build` produces the static frontend, and `npm run preview` previews it
with the same proxy. A production deployment needs its own reverse proxy for
`/api/` and `/media/`.

## Verify

```sh
docker compose exec -T app python manage.py test cinema.tests --noinput
docker compose exec -T app python manage.py check
docker compose exec -T app python manage.py makemigrations --check --dry-run
docker compose exec -T app flake8 --config=/etc/flake8 .
docker compose exec -T app python -m pip check
cd frontend
npm test
npm run build
```

The frontend regression tests cover real API paths, token refresh, screening
selection, and local screening times. Backend integration tests cover JWT
booking, order ownership, availability, and atomic rejection of duplicate seats.

For submission, capture sign-in/sign-up, the movie list/details, session
list/seat selection, orders, profile, and every staff list/create form. Attach
the screenshots to the pull request after publication is approved. Database
files, environment secrets, uploaded media, and local evidence stay out of Git.
