# Cinema Fullstack

<img width="1498" height="906" alt="Screenshot 2026-07-14 at 17 53 20" src="https://github.com/user-attachments/assets/67548b9e-3cca-4ccf-aeff-72681e373d7e" />
<img width="1510" height="650" alt="Screenshot 2026-07-14 at 17 53 26" src="https://github.com/user-attachments/assets/f570d0d4-739f-439c-8caf-8b91469843bf" />
<img width="1512" height="610" alt="Screenshot 2026-07-14 at 17 53 30" src="https://github.com/user-attachments/assets/c04ca27e-f046-4106-a938-ec911aba613e" />
<img width="1477" height="631" alt="Screenshot 2026-07-14 at 17 53 35" src="https://github.com/user-attachments/assets/effbbe45-ce55-48bf-b8c3-06f44e83b897" />
<img width="1487" height="518" alt="Screenshot 2026-07-14 at 17 53 39" src="https://github.com/user-attachments/assets/7af19c52-75df-4852-9e80-6c7e1aeee260" />



# Cinema Fullstack

Full-stack **Cinema Shop**: Django REST API backend connected to a Vue + Vite frontend.

## Task

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

## Tech stack

- **Backend:** Django 5, Django REST Framework, SimpleJWT, PostgreSQL (Docker)
- **Frontend:** Vue 2, Vite, Axios
- **Auth:** JWT (access / refresh)
- **CORS:** `django-cors-headers`

## How to run

### 1. Backend (Docker)

Create a `.env` file in the **project root**:

```env
POSTGRES_HOST=db
POSTGRES_DB=cinema
POSTGRES_USER=cinema
POSTGRES_PASSWORD=cinema
```

Build the containers, load the sample data and create an admin user:

```bash
docker compose up -d --build
docker compose cp sample_cinema.json app:/tmp/sample_cinema.json
docker compose exec app python manage.py loaddata /tmp/sample_cinema.json
docker compose exec app python manage.py createsuperuser
```

The API is available at **http://127.0.0.1:8080**.

### 2. Frontend (Vite)

Create a `.env` file inside the **`frontend/`** folder:

```env
VITE_API_URL=http://127.0.0.1:8080
```

Install dependencies and start the dev server:

```bash
cd frontend
npm install
npm run dev
```

The UI is available at **http://localhost:5173**.

> CORS is enabled on the backend via `django-cors-headers`, so the frontend
> origin (`localhost:5173`) is allowed to call the API on `localhost:8080`.

## Screens

Every page loads its data from the API. Open **DevTools → Network** (filter
*Fetch/XHR*) to see the requests going to `127.0.0.1:8080`.

### Sign In / Sign Up

Authentication with JWT. On success the `access` / `refresh` tokens are stored
and attached to all further requests.

- `POST /api/user/register/` — create account
- `POST /api/user/token/` — obtain JWT pair
- `POST /api/user/token/refresh/` — refresh access token


### Movies

List of all movies with filtering by actors and genres. Staff users see the
**"+"** button to add a new movie.

- `GET /api/cinema/movies/` — with `?actors=`, `?genres=`, `?title=` filters
- `GET /api/cinema/actors/`
- `GET /api/cinema/genres/`


### Movie details

Full information about a single movie: description, duration, genres, actors, poster.

- `GET /api/cinema/movies/{id}/`


### Add movie (staff only)

Create a movie and upload its poster.

- `POST /api/cinema/movies/`
- `POST /api/cinema/movies/{id}/upload-image/`



### Movie Sessions

Sessions filtered by the selected date. Shows movie, hall and available tickets.

- `GET /api/cinema/movie_sessions/?date=YYYY-MM-DD`


### Movie Session details

Hall scheme with taken / free seats; lets the user book tickets (create an order).

- `GET /api/cinema/movie_sessions/{id}/`
- `POST /api/cinema/orders/`


### Add session (staff only)

Create a new session for a movie in a hall at a chosen time.

- `GET /api/cinema/movies/`
- `GET /api/cinema/cinema_halls/`
- `POST /api/cinema/movie_sessions/`


### Cinema Halls

List of halls with size and capacity.

- `GET /api/cinema/cinema_halls/` — `POST` to create (staff)


### Genres

List of all genres.

- `GET /api/cinema/genres/` — `POST` to create (staff)



### Actors

List of all actors.

- `GET /api/cinema/actors/` — `POST` to create (staff)



### Orders

The current user's orders with booked tickets.

- `GET /api/cinema/orders/`



### Profile

View and update the current user's data.

- `GET /api/user/me/`
- `PATCH /api/user/me/`
