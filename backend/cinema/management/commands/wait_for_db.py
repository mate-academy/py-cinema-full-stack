import time

from django.core.management.base import BaseCommand, CommandError
from django.db import connections
from django.db.utils import OperationalError, InterfaceError


class Command(BaseCommand):
    help = "Wait for database readiness."  # noqa: VNE003

    def handle(self, *args, **options):
        deadline = time.monotonic() + 60
        while True:
            try:
                with connections["default"].cursor() as cursor:
                    cursor.execute("SELECT 1")
                self.stdout.write(self.style.SUCCESS("Database available!"))
                return
            except (OperationalError, InterfaceError) as error:
                if time.monotonic() >= deadline:
                    raise CommandError(
                        "Database unavailable after 60s"
                    ) from error
                connections["default"].close()
                time.sleep(1)
