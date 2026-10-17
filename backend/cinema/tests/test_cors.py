from django.test import SimpleTestCase


class FrontendCorsTests(SimpleTestCase):
    def test_frontend_can_preflight_registration(self):
        response = self.client.options(
            "/api/user/register/",
            HTTP_ORIGIN="http://localhost:5173",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response["Access-Control-Allow-Origin"], "http://localhost:5173"
        )
        self.assertIn("POST", response["Access-Control-Allow-Methods"])

    def test_unknown_origin_is_not_allowed(self):
        response = self.client.options(
            "/api/user/register/",
            HTTP_ORIGIN="https://untrusted.example",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
        )
        self.assertNotIn("Access-Control-Allow-Origin", response)
