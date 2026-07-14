from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()


class AuthViewsTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="admin", password="Sup3rSecret!", is_staff=True
        )

    def test_csrf_endpoint_sets_cookie(self):
        response = self.client.get(reverse("accounts:csrf"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("csrftoken", response.cookies)

    def test_login_with_valid_credentials(self):
        response = self.client.post(
            reverse("accounts:login"),
            {"username": "admin", "password": "Sup3rSecret!"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "admin")
        self.assertTrue(response.data["is_staff"])

    def test_login_with_invalid_credentials(self):
        response = self.client.post(
            reverse("accounts:login"),
            {"username": "admin", "password": "wrong"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 401)

    def test_me_returns_current_user_after_login(self):
        self.client.login(username="admin", password="Sup3rSecret!")
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["username"], "admin")

    def test_logout_clears_session(self):
        self.client.login(username="admin", password="Sup3rSecret!")
        response = self.client.post(reverse("accounts:logout"))
        self.assertEqual(response.status_code, 200)

        me_response = self.client.get(reverse("accounts:me"))
        self.assertEqual(me_response.status_code, 401)
