from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.content.models import Certificate, Contact, Service

User = get_user_model()


class ContentApiTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="staff", password="Sup3rSecret!", is_staff=True
        )
        self.active_service = Service.objects.create(
            title="Cloud Migration", description="We migrate", active=True
        )
        self.inactive_service = Service.objects.create(
            title="Legacy Support", description="Old stuff", active=False
        )

    def test_public_list_only_shows_active_services(self):
        response = self.client.get("/api/content/services/")
        self.assertEqual(response.status_code, 200)
        titles = [item["title"] for item in response.data]
        self.assertIn("Cloud Migration", titles)
        self.assertNotIn("Legacy Support", titles)

    def test_staff_list_shows_all_services(self):
        self.client.login(username="staff", password="Sup3rSecret!")
        response = self.client.get("/api/content/services/")
        self.assertEqual(response.status_code, 200)
        titles = [item["title"] for item in response.data]
        self.assertIn("Cloud Migration", titles)
        self.assertIn("Legacy Support", titles)

    def test_anonymous_cannot_create_service(self):
        response = self.client.post(
            "/api/content/services/", {"title": "New", "description": "x"}
        )
        self.assertEqual(response.status_code, 403)

    def test_staff_can_create_service(self):
        self.client.login(username="staff", password="Sup3rSecret!")
        response = self.client.post(
            "/api/content/services/", {"title": "New", "description": "x"}
        )
        self.assertEqual(response.status_code, 201)

    def test_contact_endpoint_creates_without_auth(self):
        response = self.client.post(
            "/api/content/contact/",
            {
                "name": "Jane",
                "email": "jane@example.com",
                "subject": "Hi",
                "message": "Hello there",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Contact.objects.count(), 1)

    def test_contact_endpoint_requires_fields(self):
        response = self.client.post("/api/content/contact/", {"name": "Jane"})
        self.assertEqual(response.status_code, 400)

    def test_verify_endpoint_returns_certificate(self):
        Certificate.objects.create(
            certificate_id="CERT-100",
            holder_name="Amy",
            course_name="Security 101",
            issue_date="2026-01-01",
        )
        response = self.client.get("/api/content/verify/?id=CERT-100")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["certificate"]["holder_name"], "Amy")

    def test_verify_endpoint_404_for_unknown_id(self):
        response = self.client.get("/api/content/verify/?id=NOPE")
        self.assertEqual(response.status_code, 404)

    def test_verify_endpoint_400_without_id(self):
        response = self.client.get("/api/content/verify/")
        self.assertEqual(response.status_code, 400)
