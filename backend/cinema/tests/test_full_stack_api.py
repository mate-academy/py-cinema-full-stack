from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from cinema.models import CinemaHall, Genre, Movie, MovieSession, Order, Ticket


class FullStackContractTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email="customer@example.com", password="customer-password"
        )
        self.hall = CinemaHall.objects.create(
            name="Main", rows=3, seats_in_row=4
        )
        self.movie = Movie.objects.create(
            title="Connection", description="Demo", duration=90
        )
        self.session = MovieSession.objects.create(
            movie=self.movie, cinema_hall=self.hall,
            show_time=timezone.now() + timedelta(days=1),
        )
        self.client.force_authenticate(self.user)

    def ticket(self, row=1, seat=1):
        return {"row": row, "seat": seat, "movie_session": self.session.pk}

    def test_registration_tokens_and_profile(self):
        self.client.force_authenticate(None)
        payload = {"email": "new@example.com", "password": "new-password"}
        response = self.client.post("/api/user/register/", payload)
        self.assertEqual(response.status_code, 201)
        self.assertNotIn("password", response.data)
        response = self.client.post("/api/user/token/", payload)
        self.assertEqual(response.status_code, 200)
        refresh = response.data["refresh"]
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        response = self.client.get("/api/user/me/")
        self.assertEqual(response.data["email"], payload["email"])
        response = self.client.post(
            "/api/user/token/refresh/", {"refresh": refresh}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_registration_cannot_grant_staff(self):
        response = self.client.post("/api/user/register/", {
            "email": "another@example.com", "password": "new-password",
            "is_staff": True,
        })
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["is_staff"])

    def test_order_updates_taken_seats_and_private_history(self):
        response = self.client.post(
            "/api/cinema/orders/", {"tickets": [self.ticket()]}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        response = self.client.get(
            f"/api/cinema/movie_sessions/{self.session.pk}/"
        )
        self.assertEqual(response.data["taken_places"], [{"row": 1, "seat": 1}])
        other = get_user_model().objects.create_user(
            email="other@example.com", password="other-password"
        )
        self.client.force_authenticate(other)
        self.assertEqual(
            self.client.get("/api/cinema/orders/").data["count"], 0
        )

    def test_booking_occupied_seat_rolls_back_entire_order(self):
        order = Order.objects.create(user=self.user)
        Ticket.objects.create(order=order, movie_session=self.session,
                              row=1, seat=1)
        response = self.client.post("/api/cinema/orders/", {
            "tickets": [self.ticket(1, 2), self.ticket()],
        }, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_duplicate_seats_and_invalid_bounds_return_400(self):
        for tickets in [[self.ticket(), self.ticket()], [self.ticket(99, 1)]]:
            response = self.client.post(
                "/api/cinema/orders/", {"tickets": tickets}, format="json"
            )
            self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)

    def test_invalid_filters_return_400(self):
        for url in [
            "/api/cinema/movies/?genres=bad",
            "/api/cinema/movies/?actors=bad",
            "/api/cinema/movie_sessions/?date=bad",
            "/api/cinema/movie_sessions/?movie=bad",
        ]:
            self.assertEqual(self.client.get(url).status_code, 400)

    def test_customer_cannot_write_catalogue(self):
        response = self.client.post("/api/cinema/genres/", {"name": "Comedy"})
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Genre.objects.exists())

    def test_cors_allows_configured_origin_only(self):
        self.client.force_authenticate(None)
        for origin, allowed in [
            ("http://localhost:5173", True),
            ("https://untrusted.example", False),
        ]:
            response = self.client.options(
                "/api/user/token/", HTTP_ORIGIN=origin,
                HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
                HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization,content-type",
            )
            self.assertEqual(
                "access-control-allow-origin" in response, allowed
            )
