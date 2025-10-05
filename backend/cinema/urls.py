# cinema/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from cinema.views import (
    GenreViewSet,
    ActorViewSet,
    CinemaHallViewSet,
    MovieViewSet,
    MovieSessionViewSet,
    OrderViewSet,
)

app_name = "cinema"

router = DefaultRouter()
router.register(r"genres", GenreViewSet, basename="genre")
router.register(r"actors", ActorViewSet, basename="actor")
router.register(r"cinema-halls", CinemaHallViewSet, basename="cinema-hall")
router.register(r"movies", MovieViewSet, basename="movie")
router.register(r"movie-sessions", MovieSessionViewSet, basename="movie-session")
router.register(r"orders", OrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
]
