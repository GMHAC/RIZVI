"""
RIZVIWORLD Django project settings.
Standalone, runnable out of the box with SQLite (upgrade to PostgreSQL for
real production — see README for one-line DATABASE_URL swap).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("RIZVI_SECRET_KEY", "dev-only-change-me-in-production-xyz123")

# DEBUG=False in production. Set env var RIZVI_DEBUG=1 for local development.
DEBUG = os.environ.get("RIZVI_DEBUG", "0") == "1"

# "*" works for LAN factory use; for internet hosting set RIZVI_ALLOWED_HOSTS
# to your real domain, comma-separated.
ALLOWED_HOSTS = os.environ.get("RIZVI_ALLOWED_HOSTS", "*").split(",")
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("RIZVI_CSRF_ORIGINS", "").split(",") if o]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "rizviworld",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "rizviworld_site.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR.parent],  # so index.html (one level up) can be served directly
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

WSGI_APPLICATION = "rizviworld_site.wsgi.application"

# ---- Database ----
# Default: SQLite file next to manage.py — zero setup, works instantly on any
# Windows/Linux laptop. For real multi-thousand-user production, set
# RIZVI_DATABASE_URL to a PostgreSQL URL (e.g. from Railway/Render's free
# Postgres) and it will be used automatically.
DATABASE_URL = os.environ.get("RIZVI_DATABASE_URL", "")
if DATABASE_URL:
    import dj_database_url
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "rizviworld_db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "bn"
TIME_ZONE = "Asia/Dhaka"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# LAN factory use: allow all origins. If you move this onto the public
# internet, tighten this to your real frontend domain instead.
CORS_ALLOW_ALL_ORIGINS = True

# How many seconds the frontend polls the server for changes (near-real-time
# sync — see README for why true "millions of updates/sec" isn't a
# meaningful target at this system's scale).
RIZVI_POLL_INTERVAL_MS = int(os.environ.get("RIZVI_POLL_INTERVAL_MS", "3000"))
