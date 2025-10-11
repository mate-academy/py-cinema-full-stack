from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Apps (frontend usa /api/cinema/…)
    path("api/cinema/", include(("cinema.urls", "cinema"), namespace="cinema")),
    path("api/user/", include(("user.urls", "user"), namespace="user")),

    # OpenAPI schema + docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/doc/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/doc/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),

    # Redireciona a raiz para a documentação (evita 404 em "/")
    path("", RedirectView.as_view(url="/api/doc/swagger/", permanent=False)),
]

# Django Debug Toolbar — só ativa se estiver instalado e em DEBUG
if settings.DEBUG and "debug_toolbar" in settings.INSTALLED_APPS:
    import debug_toolbar  # type: ignore
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]

# Servir arquivos de mídia (imagens) em dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# (Opcional) Retrocompatibilidade: descomente para manter /api/... além de /api/cinema/...
# from django.urls import re_path
# urlpatterns += [re_path(r"^api/(?!(user/|schema/|doc/)).*$", include(("cinema.urls", "cinema")))]
