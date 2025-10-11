from decimal import Decimal, InvalidOperation, ROUND_HALF_UP

from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from cinema.models import (
    Genre,
    Actor,
    CinemaHall,
    Movie,
    MovieSession,
    Ticket,
    Order,
)

# ------- helpers de dinheiro (robustos) -------
MONEY_DEFAULT = Decimal("20.00")


def _to_decimal(value, default=MONEY_DEFAULT):
    """Converte para Decimal com segurança (aceita int/float/str/Decimal)."""
    if value is None:
        return default
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default


def _money_str(value):
    """Formata como string com 2 casas, sempre."""
    dec = _to_decimal(value, MONEY_DEFAULT)
    return str(dec.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _abs_media(request, file_field):
    """
    Retorna URL ABSOLUTA para arquivos de mídia (ex.: imagens).
    - Se houver request, usa request.build_absolute_uri(file_field.url).
    - Caso contrário, retorna file_field.url (relativa).
    """
    if not file_field:
        return None
    url = getattr(file_field, "url", None)
    if not url:
        return None
    if request:
        return request.build_absolute_uri(url)
    return url


# ---------- BASIC SERIALIZERS ----------
class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ("id", "name")


class ActorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Actor
        fields = ("id", "first_name", "last_name", "full_name")


class CinemaHallSerializer(serializers.ModelSerializer):
    capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = CinemaHall
        fields = ("id", "name", "rows", "seats_in_row", "capacity")


# ---------- MOVIE SERIALIZERS ----------
class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ("id", "title", "description", "duration", "genres", "actors")


class MovieWriteSerializer(serializers.ModelSerializer):
    """
    Usado para create/update, recebendo listas de IDs para genres/actors.
    Agora:
      - 'duration' aceita string numérica e é normalizada para int (> 0).
      - 'genres' e 'actors' são opcionais (POST pode omitir).
      - 'image' pode ser incluída (opcional).
    """
    genres = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all(), required=False
    )
    actors = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Actor.objects.all(), required=False
    )

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "description",
            "duration",
            "genres",
            "actors",
            "image",
        )

    def validate_duration(self, value):
        """
        Aceita 'duration' como int ou string numérica e garante > 0.
        """
        if value in (None, ""):
            return value
        try:
            value = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                "duration deve ser um número inteiro."
            )
        if value <= 0:
            raise serializers.ValidationError(
                "duration deve ser maior que zero."
            )
        return value

    def create(self, validated_data):
        genres = validated_data.pop("genres", [])
        actors = validated_data.pop("actors", [])
        movie = Movie.objects.create(**validated_data)
        if genres:
            movie.genres.set(genres)
        if actors:
            movie.actors.set(actors)
        return movie

    def update(self, instance, validated_data):
        genres = validated_data.pop("genres", None)
        actors = validated_data.pop("actors", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if genres is not None:
            instance.genres.set(genres)
        if actors is not None:
            instance.actors.set(actors)
        return instance


class MovieListSerializer(serializers.ModelSerializer):
    """Visão compacta para listagem."""
    genres = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="name"
    )
    actors = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field="full_name"
    )
    image = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = ("id", "title", "genres", "actors", "image")

    def get_image(self, obj):
        request = self.context.get("request")
        return _abs_media(request, obj.image)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["genres"] = sorted(list(set(data["genres"])))
        data["actors"] = sorted(list(set(data["actors"])))
        return data


class MovieDetailSerializer(serializers.ModelSerializer):
    """Detalhe de filme."""
    genres = GenreSerializer(many=True, read_only=True)
    actors = ActorSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "duration",
            "description",
            "genres",
            "actors",
            "image",
        )

    def get_image(self, obj):
        request = self.context.get("request")
        return _abs_media(request, obj.image)


class MovieImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ("id", "image")


# ---------- MOVIE SESSION SERIALIZERS ----------
class MovieSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovieSession
        fields = ("id", "show_time", "movie", "cinema_hall")


class MovieSessionListSerializer(MovieSessionSerializer):
    movie_title = serializers.CharField(source="movie.title", read_only=True)
    movie_image = serializers.SerializerMethodField()
    cinema_hall_name = serializers.CharField(
        source="cinema_hall.name", read_only=True
    )
    cinema_hall_capacity = serializers.IntegerField(
        source="cinema_hall.capacity", read_only=True
    )
    tickets_available = serializers.SerializerMethodField()

    class Meta:
        model = MovieSession
        fields = (
            "id",
            "show_time",
            "movie_title",
            "movie_image",
            "cinema_hall_name",
            "cinema_hall_capacity",
            "tickets_available",
        )

    def get_movie_image(self, obj):
        request = self.context.get("request")
        return _abs_media(request, getattr(obj.movie, "image", None))

    def get_tickets_available(self, obj):
        """
        Calcula assentos disponíveis: capacidade - ingressos vendidos.
        Usa related_name='tickets' no modelo.
        """
        capacity = obj.cinema_hall.capacity
        taken = getattr(obj, "tickets", None)
        taken_count = taken.count() if taken is not None else 0
        return max(capacity - taken_count, 0)


# ---------- TICKET SERIALIZERS ----------
class TicketSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        Ticket.validate_ticket(
            attrs["row"],
            attrs["seat"],
            data["movie_session"].cinema_hall,
            ValidationError,
        )
        return data

    class Meta:
        model = Ticket
        fields = ("id", "row", "seat", "movie_session")


class TicketListSerializer(TicketSerializer):
    movie_session = MovieSessionListSerializer(many=False, read_only=True)


class TicketSeatsSerializer(TicketSerializer):
    class Meta:
        model = Ticket
        fields = ("row", "seat")


# ---------- MOVIE SESSION DETAIL ----------
class MovieSessionDetailSerializer(MovieSessionSerializer):
    movie = MovieListSerializer(many=False, read_only=True)
    cinema_hall = CinemaHallSerializer(many=False, read_only=True)
    taken_places = TicketSeatsSerializer(
        source="tickets", many=True, read_only=True
    )

    class Meta:
        model = MovieSession
        fields = ("id", "show_time", "movie", "cinema_hall", "taken_places")


# ---------- ORDER SERIALIZERS ----------
class OrderSerializer(serializers.ModelSerializer):
    tickets = TicketSerializer(many=True, read_only=False, allow_empty=False)

    class Meta:
        model = Order
        fields = ("id", "tickets", "created_at")

    def create(self, validated_data):
        with transaction.atomic():
            tickets_data = validated_data.pop("tickets")
            order = Order.objects.create(**validated_data)
            for ticket_data in tickets_data:
                Ticket.objects.create(order=order, **ticket_data)
            return order


class OrderListSerializer(OrderSerializer):
    tickets = TicketListSerializer(many=True, read_only=True)

    # novos campos exibidos no FE
    total = serializers.SerializerMethodField()
    unit_price = serializers.SerializerMethodField()

    class Meta(OrderSerializer.Meta):
        fields = ("id", "tickets", "created_at", "total", "unit_price")

    def get_unit_price(self, obj):
        """
        Retorna o preço unitário como string 'xx.xx'.
        - Se o modelo tiver Order.unit_price, usa; senão, fallback para 20.00.
        - Aceita Decimal/float/int/str e normaliza.
        """
        price = getattr(obj, "unit_price", None)
        if price is None:
            price = MONEY_DEFAULT
        return _money_str(price)

    def get_total(self, obj):
        """
        Retorna o total como string 'xx.xx'.
        - Se o modelo tiver Order.total, usa esse valor.
        - Caso contrário calcula: (qtd tickets) × (unit_price ou 20.00).
        """
        db_total = getattr(obj, "total", None)
        if db_total is not None:
            return _money_str(db_total)

        qty = obj.tickets.count()
        unit = getattr(obj, "unit_price", None)
        if unit is None:
            unit = MONEY_DEFAULT

        total_dec = _to_decimal(unit, MONEY_DEFAULT) * qty
        return _money_str(total_dec)
