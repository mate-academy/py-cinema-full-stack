#🎬 Cinema Fullstack 

## Clone repository
`git clone <repo-url>`
`cd py-cinema-full-stack`

## 🧩 Frontend (Vue 3 + Vite)
`cd frontend`
`npm install`

### Project SetUp
`npm install`
`npm run dev`

## 🐳 3. Backend (Django + PostgreSQL у Docker)
`backend/Dockerfile`
`docker-compose.yml`

Create a .env file in backend, fill it in similarly to .env.sample

`docker compose up --build`

## Verifying that the backend is working
Open in browser:
http://localhost:8080/api/schema/
or any other endpoint

## 🔐 5. CORS
add to settings.py
INSTALLED_APPS = [
    ...
    "corsheaders",
    ...
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

## 👤 6. Create superuser
`docker compose exec app python manage.py createsuperuser`

## 🛠 7. Useful commands
`docker compose exec app python manage.py migrate`
`docker compose up --build` - if something change

## 8. Finish Docker
`docker compose down`