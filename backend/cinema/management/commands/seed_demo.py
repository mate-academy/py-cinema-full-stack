from datetime import timedelta
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from PIL import Image, ImageDraw

from cinema.models import Actor, CinemaHall, Genre, Movie, MovieSession


class Command(BaseCommand):
    help = "Seed local demo catalogue and optional accounts."  # noqa: VNE003

    def add_arguments(self, parser):
        parser.add_argument("--with-users", action="store_true")

    def handle(self, *args, **options):
        actor, _ = Actor.objects.get_or_create(
            first_name="Alex", last_name="Rivera"
        )
        genre, _ = Genre.objects.get_or_create(name="Adventure")
        hall, _ = CinemaHall.objects.get_or_create(
            name="Orion", defaults={"rows": 4, "seats_in_row": 6}
        )
        today = timezone.now().replace(
            hour=18, minute=0, second=0, microsecond=0
        )
        for index, (title, color) in enumerate([
            ("Beyond the Stars", "#253a64"),
            ("The Last Lighthouse", "#36594e"),
            ("City of Tomorrow", "#683a4a"),
        ]):
            movie, _ = Movie.objects.get_or_create(title=title, defaults={
                "description": "An original demo adventure for Cinema Shop.",
                "duration": 100,
            })
            movie.actors.add(actor)
            movie.genres.add(genre)
            if not movie.image:
                image = Image.new("RGB", (600, 800), color)
                draw = ImageDraw.Draw(image)
                draw.ellipse((150, 150, 450, 450), outline="white", width=3)
                draw.text((60, 600), title, fill="white", font_size=34)
                output = BytesIO()
                image.save(output, "PNG")
                movie.image.save("demo.png", ContentFile(output.getvalue()))
            for day in range(2):
                for hour in (index * 2, index * 2 + 1):
                    MovieSession.objects.get_or_create(
                        movie=movie, cinema_hall=hall,
                        show_time=today + timedelta(days=day, hours=hour),
                    )
        if options["with_users"]:
            for email, staff in [
                ("admin@example.com", True),
                ("visitor@example.com", False),
            ]:
                if not get_user_model().objects.filter(email=email).exists():
                    get_user_model().objects.create_user(
                        email=email, password="Cinema-demo-2026!",
                        is_staff=staff, is_superuser=staff,
                    )
            self.stdout.write("Local demo password: Cinema-demo-2026!")
        self.stdout.write(self.style.SUCCESS("Demo catalogue ready."))
