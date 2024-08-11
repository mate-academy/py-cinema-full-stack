from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser programmatically'

    def handle(self, *args, **kwargs):
        email = 'admin@example.com'
        password = '12345'

        if not get_user_model().objects.filter(email=email).exists():
            get_user_model().objects.create_superuser(email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superuser "{email}" created successfully'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser "{email}" already exists'))
