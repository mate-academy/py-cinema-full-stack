import tempfile
from datetime import datetime
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from cinema.models import CinemaHall, Movie, MovieSession


class FrontendIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email="viewer@example.com", password="cinema-test-pass"
        )
        self.movie = Movie.objects.create(
            title="Demo", description="Demo movie", duration=90
        )
        hall = CinemaHall.objects.create(name="Blue", rows=5, seats_in_row=8)
        self.session = MovieSession.objects.create(
            movie=self.movie, cinema_hall=hall, show_time=datetime(2026, 9, 27, 18)
        )

    def test_login_details_and_booking_using_frontend_urls(self):
        login = self.client.post(
            "/api/user/token/",
            {"email": self.user.email, "password": "cinema-test-pass"},
        )
        self.assertEqual(login.status_code, 200)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )
        self.assertEqual(self.client.get("/api/user/me/").status_code, 200)
        movie = self.client.get(f"/api/cinema/movies/{self.movie.pk}/")
        self.assertEqual(movie.status_code, 200)
        self.assertEqual(movie.data["id"], self.movie.pk)
        session_url = f"/api/cinema/movie_sessions/{self.session.pk}/"
        self.assertEqual(self.client.get(session_url).status_code, 200)
        order = self.client.post(
            "/api/cinema/orders/",
            {"tickets": [{"row": 1, "seat": 2, "movie_session": self.session.pk}]},
            format="json",
        )
        self.assertEqual(order.status_code, 201)
        self.assertEqual(
            self.client.get(session_url).data["taken_places"],
            [{"row": 1, "seat": 2}],
        )
        self.assertEqual(self.client.get("/api/cinema/orders/").data["count"], 1)

    def test_details_require_authentication(self):
        for url in (
            f"/api/cinema/movies/{self.movie.pk}/",
            f"/api/cinema/movie_sessions/{self.session.pk}/",
        ):
            self.assertEqual(self.client.get(url).status_code, 401)

    def test_image_upload_requires_staff_and_accepts_upload(self):
        url = f"/api/cinema/movies/{self.movie.pk}/upload-image/"
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.post(url, {}).status_code, 403)
        self.user.is_staff = True
        self.user.save()
        image = BytesIO()
        Image.new("RGB", (10, 10)).save(image, format="PNG")
        upload = SimpleUploadedFile(
            "poster.png", image.getvalue(), content_type="image/png"
        )
        with tempfile.TemporaryDirectory() as directory:
            with override_settings(MEDIA_ROOT=directory):
                response = self.client.post(url, {"image": upload})
                self.assertEqual(response.status_code, 200)
                self.assertIn("/media/uploads/movies/", response.data["image"])

    def test_registration_and_refresh(self):
        response = self.client.post(
            "/api/user/register/",
            {"email": "new@example.com", "password": "cinema-test-pass"},
        )
        self.assertEqual(response.status_code, 201)
        login = self.client.post(
            "/api/user/token/",
            {"email": "new@example.com", "password": "cinema-test-pass"},
        )
        response = self.client.post(
            "/api/user/token/refresh/", {"refresh": login.data["refresh"]}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
