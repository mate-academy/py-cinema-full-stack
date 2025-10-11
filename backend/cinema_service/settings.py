"""
Django settings for cinema_service project.
"""
from __future__ import annotations

import os
from datetime import timedelta
from pathlib import Path
from typing import List, Dict, Any
from urllib.parse import urlparse, unquote

# ---------------------------------------------------------------------
# Paths / core
# ---------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}

def _env_list(name: str, default: List[str]) -> List[str]:
    """Split comma-separated env var into a list (trim spaces)."""
    raw = os.getenv(name)
    if not raw:
        return default
    return [item.strip() for item in raw.split(",") if item.strip()]

def _parse_database_url(url: str) -> Dict[str, Any]:
    """
    Minimal DATABASE_URL parser (postgres/sqlite) para evitar depender de dj-database-url.
    Ex.: postgres://USER:PASS@HOST:PORT/DBNAME
    """
    parsed = urlparse(url)
    engine = parsed.scheme
    if engine.startswith("postgres"):
        engine = "django.db.backends.postgresql"
    elif engine in {"sqlite", "sqlite3"}:
        engine = "django.db.backends.sqlite3"
        db_path = parsed.path.lstrip("/") or "db.sqlite3"
        return {"ENGINE": engine, "NAME": BASE_DIR / db_path}

    return {
        "ENGINE": engine,
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "",
        "PORT": int(parsed.port) if parsed.port else "",
    }

# ---------------------------------------------------------------------
# Security / debug
# ---------------------------------------------------------------------
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-6vubhk2$++agnctay_4pxy_8cq)mosmn(*-#2b^v4cgsh-^!i3",
)

DEBUG = _env_bool("DJANGO_DEBUG", True)

# Em dev/host local, incluir localhost/127.0.0.1/0.0.0.0 por padrão.
ALLOWED_HOSTS: List[str] = _env_list(
    "DJANGO_ALLOWED_HOSTS",
    ["localhost", "127.0.0.1", "0.0.0.0"],
)

INTERNAL_IPS = ["127.0.0.1", "localhost"]

# ---------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "django_filters",

    # third-party
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "debug_toolbar",

    # project apps
    "cinema",
    "user",
]

MIDDLEWARE = [
    # Recomendado: Security primeiro, CORS logo antes de CommonMiddleware
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "cinema_service.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "cinema_service.wsgi.application"

# ---------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    DATABASES = {"default": _parse_database_url(DATABASE_URL)}
else:
    if DEBUG:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / "db.sqlite3",
            }
        }
    else:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": os.getenv("POSTGRES_DB", "postgres"),
                "USER": os.getenv("POSTGRES_USER", "postgres"),
                "PASSWORD": os.getenv("POSTGRES_PASSWORD", "postgres"),
                "HOST": os.getenv("POSTGRES_HOST", os.getenv("DB_HOST", "db")),
                "PORT": int(os.getenv("POSTGRES_PORT", os.getenv("DB_PORT", "5432"))),
            }
        }

# ---------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        )
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "user.User"

# ---------------------------------------------------------------------
# I18N / TZ
# ---------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = False  # manter como está para não quebrar migrações/testes existentes

# ---------------------------------------------------------------------
# Static & Media
# ---------------------------------------------------------------------
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media" if DEBUG else Path("/vol/web/media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------
# DRF / OpenAPI
# ---------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_PAGINATION_CLASS": "cinema.pagination.DefaultPagination",
    "PAGE_SIZE": 10,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Cinema Service API",
    "DESCRIPTION": "Order cinema tickets",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SWAGGER_UI_SETTINGS": {
        "deepLinking": True,
        "defaultModelRendering": "model",
        "defaultModelsExpandDepth": 2,
        "defaultModelExpandDepth": 2,
    },
}

# ---------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------
SIMPLE_JWT = {
    # 60*60 = 3600 minutos (60 horas)
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60 * 60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
}

# ---------------------------------------------------------------------
# CORS / CSRF
# ---------------------------------------------------------------------
_default_cors = ["http://localhost:5173", "http://127.0.0.1:5173"]

CORS_ALLOWED_ORIGINS: List[str] = _env_list(
    "CORS_ALLOWED_ORIGINS",
    _default_cors,
)

# No Django 4+, devem ser origens completas (com esquema e porta)
CSRF_TRUSTED_ORIGINS: List[str] = _env_list(
    "CSRF_TRUSTED_ORIGINS",
    CORS_ALLOWED_ORIGINS,
)

# Em JWT puro, não precisamos de cookies cross-site
CORS_ALLOW_CREDENTIALS = False

# Opcional: expor cabeçalhos úteis (ex.: para downloads do DRF)
CORS_EXPOSE_HEADERS = ["Content-Disposition"]

# ---------------------------------------------------------------------
# Business constants
# ---------------------------------------------------------------------
# Mantém o mesmo tipo (string) usado no seu projeto original
# e permite sobrescrever via .env se desejar:
#   TICKET_UNIT_PRICE=20.00
TICKET_UNIT_PRICE = os.getenv("TICKET_UNIT_PRICE", "20.00")

# ---------------------------------------------------------------------
# Debug toolbar
# ---------------------------------------------------------------------
DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: DEBUG,
}
