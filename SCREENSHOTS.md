# Cinema Shop — screenshots required for Mate Academy

**Take these on your own running local frontend.** Screenshots cannot be taken from the submitted source archive alone: they must show that the browser is communicating with **your** Django API.

For each page: open `http://localhost:5173/`, press **F12**, select **Network > Fetch/XHR** (Firefox: **Мережа > XHR**), enable **Persist logs** if navigating, clear old requests, then reload or use the UI. Capture the page **and** the relevant request/status. Hide passwords, JWTs, and authorization headers.

## Normal user account

- [ ] `screenshots/01-sign-up.png` — registration form and `POST /api/user/register/` (201). Capture before automatic navigation if possible; otherwise a separate screenshot of the blank Sign Up form plus the registration request evidence.
- [ ] `screenshots/02-sign-in.png` — login form and `POST /api/user/token/` (200).
- [ ] `screenshots/03-movies.png` — movie cards, `GET /api/cinema/movies/` (200) and actors/genres filters.
- [ ] `screenshots/04-movie-details.png` — movie details modal, `GET /api/cinema/movies/<id>/` (200).
- [ ] `screenshots/05-movie-sessions.png` — sessions for a date with results, `GET /api/cinema/movie_sessions/?date=...` (200).
- [ ] `screenshots/06-session-details.png` — seat diagram, `GET /api/cinema/movie_sessions/<id>/` (200).
- [ ] `screenshots/07-booking.png` — successful `POST /api/cinema/orders/` (201) before navigating or using **Persist logs**.
- [ ] `screenshots/08-my-orders.png` — visible booked tickets, `GET /api/cinema/orders/` (200).
- [ ] `screenshots/09-my-profile.png` — profile page and `GET /api/user/me/` or a successful `PATCH /api/user/me/` (200).

## Staff account (create with `createsuperuser`)

- [ ] `screenshots/10-actors.png` — list of actors, `GET /api/cinema/actors/` (200).
- [ ] `screenshots/11-genres.png` — list of genres, `GET /api/cinema/genres/` (200).
- [ ] `screenshots/12-cinema-halls.png` — list of halls, `GET /api/cinema/cinema_halls/` (200).
- [ ] `screenshots/13-add-hall.png` — create hall form and successful POST (201), if creating test data.
- [ ] `screenshots/14-add-movie.png` — create movie form and successful POST (201), image upload (200) if used.
- [ ] `screenshots/15-add-session.png` — create movie session form and successful POST (201), if creating test data.

Only submit screenshots of functionality that actually works. Do not fabricate statuses or API responses. If an action fails, correct it before using that screenshot as evidence. You can drag screenshot files into the Pull Request description on GitHub or commit them in this folder according to your course's submission instructions.
