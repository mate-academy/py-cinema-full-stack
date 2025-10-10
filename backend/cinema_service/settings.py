"""
Django settings for cinema_service project.
"""
import os
from datetime import timedelta
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
SECRET_KEY = "django-insecure-6vubhk2$++agnctay_4pxy_8cq)mosmn(*-#2b^v4cgsh-^!i3"

# DEBUG: pode ser controlado por variável de ambiente DJANGO_DEBUG=1/0
DEBUG = os.getenv("DJANGO_DEBUG", "1") == "1"

# Em DEV podemos deixar aberto
ALLOWED_HOSTS: list[str] = ["*"]

INTERNAL_IPS = ["127.0.0.1", "localhost"]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_filters",
    # Terceiros
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "debug_toolbar",
    # Apps do projeto
    "cinema",
    "user",
]

MIDDLEWARE = [
    # **CORS precisa vir antes de CommonMiddleware (e logo no topo é o mais seguro)**
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
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

# --------------------------------------------------------------------
# Database
# Em DEV (DEBUG=True ou DJANGO_DEBUG=1), usar SQLite para rodar local
# sem precisar do container/serviço "db". Em produção, Postgres.
# --------------------------------------------------------------------
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
            "HOST": os.getenv("POSTGRES_HOST", "db"),
            "PORT": int(os.getenv("POSTGRES_PORT", "5432")),
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "user.User"

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = False

# Static & Media
STATIC_URL = "static/"
MEDIA_URL = "/media/"
# Em produção você usava /vol/web/media (via Docker). Em DEV, salve local.
if DEBUG:
    MEDIA_ROOT = BASE_DIR / "media"
else:
    MEDIA_ROOT = "/vol/web/media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# DRF
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
    # OpenAPI schema
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # paginação global
    "DEFAULT_PAGINATION_CLASS": "cinema.pagination.DefaultPagination",
    "PAGE_SIZE": 10,
}

# OpenAPI / Swagger
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

# JWT
SIMPLE_JWT = {
    # Observação: 60*60 = 3600 minutos (60 horas). Mantido igual ao seu arquivo.
    # Para demonstrar refresh facilmente, você pode TEMPORARIAMENTE
    # reduzir para algo como timedelta(minutes=5) durante os screenshots.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60 * 60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": False,
}

# --------------------------------------------------------------------
# CORS (modo DEV — liberar geral para depuração do front local)
# Depois que funcionar, troque por CORS_ALLOWED_ORIGINS restrito.
# --------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True          # DEV: libera qualquer origem
CORS_ALLOW_CREDENTIALS = False
CORS_ALLOW_HEADERS = ["*"]
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
# Alternativa mais restrita:
# CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Opcional: se for usar cookies/CSRF (não é o caso com JWT)
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]

# 💵 Preço do ingresso (usado no serializer de Order)
TICKET_UNIT_PRICE = "20.00"
