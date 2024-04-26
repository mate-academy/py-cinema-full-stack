import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True) is None:
            email = os.environ.get("ADMIN_EMAIL")
            password = os.environ.get("ADMIN_PASSWORD")
            print("Creating superuser")
            User.objects.create_superuser(email=email, password=password)
        else:
            print(
                "Admin accounts can only be "
                "initialized if no Accounts exist"
            )
