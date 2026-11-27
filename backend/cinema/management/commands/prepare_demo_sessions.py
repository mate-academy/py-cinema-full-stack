"""Move old fixture movie sessions into the next week for local UI demos."""

from datetime import datetime, timedelta, time

from django.core.management.base import BaseCommand

from cinema.models import MovieSession


class Command(BaseCommand):
    help = "Move past movie sessions into tomorrow for local UI testing"

    def handle(self, *args, **options):
        old_sessions = list(
            MovieSession.objects.filter(show_time__lt=datetime.now()).order_by("pk")
        )
        if not old_sessions:
            self.stdout.write("No past movie sessions to update.")
            return

        tomorrow = datetime.now().date() + timedelta(days=1)
        for index, session in enumerate(old_sessions):
            # Stagger show times for easier testing of multiple sessions.
            start = datetime.combine(tomorrow, time(hour=16, minute=0))
            session.show_time = start + timedelta(minutes=90 * index)
            session.save(update_fields=["show_time"])
        self.stdout.write(
            self.style.SUCCESS(
                f"Prepared {len(old_sessions)} demo session(s) for {tomorrow}."
            )
        )
