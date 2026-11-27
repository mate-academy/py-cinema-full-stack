# Cinema Fullstack — connected Django + Vue Cinema Shop

Backend: Django REST Framework + PostgreSQL. Frontend: Vue 2 + Vite 3.

## Local setup on Windows (PyCharm / Command Prompt)

1. Start **Docker Desktop**.
2. In the project root, create `.env` from `.env.sample`:

   ```cmd
   copy .env.sample .env
   ```

   In `.env`, set a strong `POSTGRES_PASSWORD` and keep `POSTGRES_HOST=db`.
   **Never commit `.env`.**
3. Start backend and PostgreSQL:

   ```cmd
   docker compose up --build -d
   docker compose ps
   ```

   Backend API root: http://127.0.0.1:8080/api/cinema/
   API docs: http://127.0.0.1:8080/api/doc/swagger/
4. For a **fresh** database, load the included demo fixture:

   ```cmd
   copy sample_cinema.json backend\sample_cinema.json
   docker compose exec app python manage.py loaddata sample_cinema.json
   del backend\sample_cinema.json
   ```

   Do not load it again if the database already has this data. The fixture
   contains old cinema show times. To make old showings available tomorrow:

   ```cmd
   docker compose exec app python manage.py prepare_demo_sessions
   ```

   This is an **opt-in local-demo command** that moves only past showings.
   It does not alter the fixture file.
5. Start frontend in another Command Prompt / PyCharm terminal:

   ```cmd
   cd frontend
   copy .env.sample .env
   npm ci
   npm run dev
   ```

   Open http://localhost:5173/ (the configured Vite origin).
   `VITE_API_URL` in `frontend/.env` must be `http://127.0.0.1:8080`.
   If changing `.env`, restart `npm run dev`.

6. Use the **Sign Up** page to create a normal account, then Sign In.
   For staff-only pages (Actors, Genres, Cinema Halls, Add Movie, Add Session),
   create a Django superuser with:

   ```cmd
   docker compose exec app python manage.py createsuperuser
   ```

   Django uses **email** for login, not username. Log in using the staff
   account's email/password to see the staff menu.

## Verification

Backend checks/tests:

```cmd
docker compose exec app python manage.py check
docker compose exec app python manage.py test
```

Frontend lint and build:

```cmd
cd frontend
npm ci
npm run build
npm run dev
```

With DevTools > Network > Fetch/XHR open, verify the following:

- Registration: `POST /api/user/register/` — normally HTTP 201.
- Login: `POST /api/user/token/` — HTTP 200 for valid credentials.
- Movies: `GET /api/cinema/movies/` — HTTP 200; click a movie for `GET /api/cinema/movies/<id>/`.
- Filters: `GET /api/cinema/actors/`, `genres/`, and filtered movie list requests.
- Sessions: `GET /api/cinema/movie_sessions/?date=YYYY-MM-DD` — HTTP 200.
- Session detail: `GET /api/cinema/movie_sessions/<id>/` — HTTP 200.
- Booking: select **available** seats and press Make order. `POST /api/cinema/orders/` should return HTTP 201. The app redirects to **My orders**, which requests `GET /api/cinema/orders/` (HTTP 200).
- Profile: `GET/PATCH /api/user/me/` — HTTP 200 with authentication.
- Staff pages: actor/genre/hall lists, movie/hall/session creation, movie poster upload. Creating a resource should return HTTP 201; poster upload HTTP 200.

Posters in `sample_cinema.json` refer to image files **not included** in the supplied project archive. The frontend shows a fallback placeholder if those files are missing. To show real posters, upload legitimate images through the staff **Add movie** screen or the Django admin. The demo fixture itself does not contain image bytes.

## Screenshots for Mate Academy

See [SCREENSHOTS.md](SCREENSHOTS.md). Save genuine screenshots of each working page together with **DevTools > Network > Fetch/XHR** showing relevant requests. Do not share request payloads with passwords, authorization headers, or JWT tokens.

## Troubleshooting

- `404` on `/` at port 8080 is expected (Django only serves API routes).
- `500` for an API `POST` without a trailing slash: the frontend should call the slash-terminated route.
- `401` on `/api/user/token/`: invalid credentials; use your Cinema Shop account.
- No sessions today: execute `prepare_demo_sessions` on the fixture DB, then choose tomorrow's date.
- No posters: fixture includes paths but not image files, so placeholders are expected.
- `docker compose` warning about `version` is harmless; this archive removes the obsolete key.
- If backend quits: `docker compose logs --tail=100 app`.

Keep your PR open for review and never commit `.env`, `node_modules`, or local virtual environments.
