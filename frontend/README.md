### Auth & CORS (DEV)
- Endpoints disponíveis:
  - `POST /api/user/token/`
  - `POST /api/user/token/refresh/`
  - `GET /api/user/me/`
- CORS habilitado em DEV no `settings.py`:
  - `CORS_ALLOW_ALL_ORIGINS = True`
  - `CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]`
- Frontend aponta para o backend via `frontend/.env`: `VITE_API_URL=http://localhost:8080`
