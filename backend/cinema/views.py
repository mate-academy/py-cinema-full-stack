from datetime import datetime

from django.db.models import F, Count
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from cinema.models import Genre, Actor, CinemaHall, Movie, MovieSession, Order
from cinema.permissions import IsAdminOrIfAuthenticatedReadOnly

from cinema.serializers import (
    GenreSerializer,
    ActorSerializer,
    CinemaHallSerializer,
    MovieSerializer,
    MovieSessionSerializer,
    MovieSessionListSerializer,
    MovieDetailSerializer,
    MovieSessionDetailSerializer,
    MovieListSerializer,
    OrderSerializer,
    OrderListSerializer,
    MovieImageSerializer,
    MovieWriteSerializer,
)


# ---------- GENRE ----------
class GenreViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = (IsAdminOrIfAuthenticatedReadOnly,)


# ---------- ACTOR ----------
class ActorViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = Actor.objects.all()
    serializer_class = ActorSerializer
    permission_classes = (IsAdminOrIfAuthenticatedReadOnly,)


# ---------- CINEMA HALL ----------
class CinemaHallViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    GenericViewSet,
):
    queryset = CinemaHall.objects.all()
    serializer_class = CinemaHallSerializer
    permission_classes = (IsAdminOrIfAuthenticatedReadOnly,)


# ---------- MOVIE ----------
class MovieViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Movie.objects
        .prefetch_related("genres", "actors")
        .distinct()
        .order_by("title")
    )
    serializer_class = MovieSerializer
    permission_classes = (IsAdminOrIfAuthenticatedReadOnly,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    @staticmethod
    def _params_to_ints(qs: str):
        """Compat: '1,2,3' -> [1, 2, 3]."""
        return [int(str_id) for str_id in qs.split(",") if str_id.strip().isdigit()]

    def _gather_ids(self, name: str):
        """
        Aceita '?name=1,2,3' OU '?name=1&name=2'. Ignora inválidos.
        """
        raw_vals = self.request.query_params.getlist(name) or []
        single = self.request.query_params.get(name)
        if single and single not in raw_vals:
            raw_vals.append(single)

        ids = []
        for chunk in raw_vals:
            for part in str(chunk).split(","):
                part = part.strip()
                if not part:
                    continue
                try:
                    ids.append(int(part))
                except ValueError:
                    continue
        return ids

    def get_queryset(self):
        title = self.request.query_params.get("title")
        genre_ids = self._gather_ids("genres")
        actor_ids = self._gather_ids("actors")

        queryset = self.queryset
        if title:
            queryset = queryset.filter(title__icontains=title)
        if genre_ids:
            queryset = queryset.filter(genres__id__in=genre_ids)
        if actor_ids:
            queryset = queryset.filter(actors__id__in=actor_ids)
        return queryset.distinct().order_by("title")

    def get_serializer_class(self):
        if self.action == "list":
            return MovieListSerializer
        if self.action == "retrieve":
            return MovieDetailSerializer
        if self.action == "upload_image":
            return MovieImageSerializer
        if self.action in ("create", "update", "partial_update"):
            # escrita por IDs + validação de duration (string -> int > 0)
            return MovieWriteSerializer
        return MovieSerializer

    @action(
        methods=["POST"],
        detail=True,
        url_path="upload-image",
        permission_classes=[IsAdminUser],
    )
    def upload_image(self, request, pk=None):
        movie = self.get_object()
        serializer = self.get_serializer(movie, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "genres",
                type={"type": "array", "items": {"type": "integer"}},
                description=(
                    "Filtra por IDs de gênero. Aceita '?genres=2,5' "
                    "ou '?genres=2&genres=5'."
                ),
            ),
            OpenApiParameter(
                "actors",
                type={"type": "array", "items": {"type": "integer"}},
                description=(
                    "Filtra por IDs de ator. Aceita '?actors=2,5' "
                    "ou '?actors=2&actors=5'."
                ),
            ),
            OpenApiParameter(
                "title",
                type=OpenApiTypes.STR,
                description="Filtro por título do filme (ex.: ?title=fiction).",
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# ---------- MOVIE SESSION ----------
class MovieSessionViewSet(viewsets.ModelViewSet):
    queryset = (
        MovieSession.objects
        .all()
        .select_related("movie", "cinema_hall")
        .annotate(
            tickets_available=(
                F("cinema_hall__rows")
                * F("cinema_hall__seats_in_row")
                - Count("tickets")
            )
        )
    )
    serializer_class = MovieSessionSerializer
    permission_classes = (IsAdminOrIfAuthenticatedReadOnly,)

    def get_queryset(self):
        date = self.request.query_params.get("date")
        movie_id_str = self.request.query_params.get("movie")

        queryset = self.queryset
        if date:
            try:
                date = datetime.strptime(date, "%Y-%m-%d").date()
                queryset = queryset.filter(show_time__date=date)
            except ValueError:
                pass
        if movie_id_str:
            try:
                queryset = queryset.filter(movie_id=int(movie_id_str))
            except ValueError:
                pass
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return MovieSessionListSerializer
        if self.action == "retrieve":
            return MovieSessionDetailSerializer
        return MovieSessionSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(
                "movie",
                type=OpenApiTypes.INT,
                description="Filter by movie id (ex. ?movie=2)",
            ),
            OpenApiParameter(
                "date",
                type=OpenApiTypes.DATE,
                description="Filter by date (ex. ?date=2022-10-23)",
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# ---------- ORDER ----------
class OrderViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,   # DELETE /orders/<id>/
    GenericViewSet,
):
    """
    Leitura/Criação/Cancelamento restritos ao usuário autenticado.
    Paginação: usa a global (cinema.pagination.DefaultPagination).
    """
    queryset = Order.objects.prefetch_related(
        "tickets__movie_session__movie",
        "tickets__movie_session__cinema_hall",
    )
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Order.objects.none()
        return (
            Order.objects.filter(user=user)
            .prefetch_related(
                "tickets__movie_session__movie",
                "tickets__movie_session__cinema_hall",
            )
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return OrderListSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Impede cancelar pedidos de sessões já iniciadas."""
        order = self.get_object()
        now = datetime.now()  # projeto sem USE_TZ
        for tim in order.tickets.select_related("movie_session"):
            if tim.movie_session.show_time <= now:
                return Response(
                    {
                        "detail": (
                            "You cannot cancel an order for a session "
                            "that already started."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return super().destroy(request, *args, **kwargs)
