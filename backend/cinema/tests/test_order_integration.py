from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from cinema.models import CinemaHall, Movie, MovieSession, Order, Ticket


class BookingIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.raise_request_exception = False
        self.user = get_user_model().objects.create_user(
            "customer@example.com", "test-password"
        )
        response = self.client.post(
            reverse("user:token_obtain_pair"),
            {"email": self.user.email, "password": "test-password"},
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )
        self.session = MovieSession.objects.create(
            movie=Movie.objects.create(
                title="Cinema", description="A movie", duration=90
            ),
            cinema_hall=CinemaHall.objects.create(
                name="Main", rows=3, seats_in_row=4
            ),
            show_time="2026-10-22T18:00:00",
        )
        self.url = reverse("cinema:order-list")

    def ticket(self, seat):
        return {"movie_session": self.session.id, "row": 1, "seat": seat}

    def test_duplicate_seats_in_one_order_return_validation_error(self):
        response = self.client.post(
            self.url, {"tickets": [self.ticket(1), self.ticket(1)]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(Ticket.objects.count(), 0)

    def test_already_booked_seat_rolls_back_the_whole_order(self):
        self.client.post(
            self.url, {"tickets": [self.ticket(2)]}, format="json"
        )
        response = self.client.post(
            self.url, {"tickets": [self.ticket(1), self.ticket(2)]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Ticket.objects.count(), 1)

    def test_booking_updates_availability_and_history_for_its_owner(self):
        response = self.client.post(
            self.url, {"tickets": [self.ticket(1)]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        history = self.client.get(self.url)
        self.assertEqual(history.data["count"], 1)
        self.assertEqual(
            history.data["results"][0]["tickets"][0]["seat"], 1
        )
        sessions = self.client.get(reverse("cinema:moviesession-list"))
        self.assertEqual(sessions.data[0]["tickets_available"], 11)

        another_user = get_user_model().objects.create_user(
            "another@example.com", "test-password"
        )
        self.client.force_authenticate(another_user)
        self.assertEqual(self.client.get(self.url).data["count"], 0)
