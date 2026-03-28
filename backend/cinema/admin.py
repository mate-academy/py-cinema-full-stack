from django.contrib import admin
from .models import (
    CinemaHall,
    Genre,
    Actor,
    Movie,
    MovieSession,
    Order,
    Ticket,
)

@admin.register(CinemaHall)
class CinemaHallAdmin(admin.ModelAdmin):
    list_display = ("name", "rows", "seats_in_row", "capacity")

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name",)

@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name")

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "duration")
    filter_horizontal = ("genres", "actors")

@admin.register(MovieSession)
class MovieSessionAdmin(admin.ModelAdmin):
    list_display = ("movie", "show_time", "cinema_hall")
    list_filter = ("show_time", "cinema_hall")

class TicketInline(admin.TabularInline):
    model = Ticket
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    list_filter = ("created_at",)
    inlines = (TicketInline,)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("movie_session", "row", "seat", "order")
    list_filter = ("movie_session__movie", "movie_session__show_time")
