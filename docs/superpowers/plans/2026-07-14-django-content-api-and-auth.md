# Django Content API + Accounts Auth (Milestone 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the 12 content models (from Milestone 1) over a DRF REST API — public read on
published/active items, staff-only write — plus a real `apps.accounts` login/logout/session
system replacing the old Next.js static-cookie admin auth. Also ports `contact` (create) and
`verify` (certificate lookup) as public API endpoints.

**Architecture:** `apps.accounts` owns session-based DRF auth (login/logout/me/csrf). `apps.content`
gets a `permissions.py` (staff-write/public-read), `serializers.py` (one `ModelSerializer` per
model), `views.py` (one `ModelViewSet` per model, queryset filtered to active/published for
non-staff), and `urls.py` (DRF router + two plain function views for contact/verify). Everything
is wired under `/api/` in `config/urls.py`. This is Milestone 2 of
`docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`; Milestone 3
(exam API) is a separate plan.

**Tech Stack:** Django 4.2, djangorestframework 3.15, django-cors-headers (already installed).

---

## Note on scope

Builds directly on Milestone 1 (`docs/superpowers/plans/2026-07-14-django-backend-models.md`,
already merged — commits `11202c0`..`687a39c`). Assumes `backend/venv`, all 16 models, and
migrations are already in place. Does not touch `apps/exam` (Milestone 3).

## File Structure

```
backend/
  config/
    settings.py     (MODIFY: add CORS_ALLOW_CREDENTIALS, SESSION_COOKIE_SAMESITE, CSRF_TRUSTED_ORIGINS)
    urls.py          (MODIFY: wire in /api/ routes)
  apps/
    accounts/
      __init__.py
      apps.py
      urls.py
      views.py
      tests/
        __init__.py
        test_views.py
    content/
      permissions.py
      serializers.py
      views.py
      urls.py
      tests/
        test_api.py
```

---

### Task 1: Settings for session auth across origins

**Files:**
- Modify: `backend/config/settings.py`

- [ ] **Step 1: Add cross-origin session/CSRF settings**

Open `backend/config/settings.py`, find the `CORS_ALLOWED_ORIGINS` line, and add directly
below it:

```python
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["http://localhost:5173"])
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
```

Add `CSRF_TRUSTED_ORIGINS=http://localhost:5173` to `backend/.env.example` and `backend/.env`
(new line, alongside the existing `CORS_ALLOWED_ORIGINS`).

- [ ] **Step 2: Verify settings load cleanly**

Run: `cd backend && venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Commit**

```bash
git add backend/config/settings.py backend/.env.example
git commit -m "Add cross-origin session/CSRF settings for Vite frontend"
git push origin main
```

---

### Task 2: `apps.accounts` — login/logout/me/csrf

**Files:**
- Create: `backend/apps/accounts/__init__.py`
- Create: `backend/apps/accounts/apps.py`
- Create: `backend/apps/accounts/views.py`
- Create: `backend/apps/accounts/urls.py`
- Create: `backend/apps/accounts/tests/__init__.py`
- Create: `backend/apps/accounts/tests/test_views.py`
- Modify: `backend/config/settings.py` (add `apps.accounts` to `INSTALLED_APPS`)

- [ ] **Step 1: Register the app**

In `backend/config/settings.py`, add `"apps.accounts",` to `INSTALLED_APPS`, right after
`"apps.content",`.

- [ ] **Step 2: Create `apps/accounts/apps.py`**

```python
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"
```

- [ ] **Step 3: Create empty `apps/accounts/__init__.py` and `apps/accounts/tests/__init__.py`**

- [ ] **Step 4: Write the failing test**

```python
# backend/apps/accounts/tests/test_views.py
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
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `cd backend && venv\Scripts\python manage.py test apps.accounts -v 2`
Expected: FAIL with `NoReverseMatch` (no `accounts` URL namespace exists yet).

- [ ] **Step 6: Write `apps/accounts/views.py`**

```python
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _user_payload(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
    }


class CsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        get_token(request)
        return Response({"detail": "CSRF cookie set"})


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=401)
        login(request, user)
        return Response(_user_payload(user))


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Logged out"})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_user_payload(request.user))
```

- [ ] **Step 7: Write `apps/accounts/urls.py`**

```python
from django.urls import path

from apps.accounts import views

app_name = "accounts"

urlpatterns = [
    path("csrf/", views.CsrfView.as_view(), name="csrf"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("me/", views.MeView.as_view(), name="me"),
]
```

- [ ] **Step 8: Wire into `config/urls.py`**

```python
# backend/config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
]
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `venv\Scripts\python manage.py test apps.accounts -v 2`
Expected: `Ran 6 tests in X.XXXs` / `OK`

- [ ] **Step 10: Commit**

```bash
git add backend/apps/accounts backend/config/settings.py backend/config/urls.py
git commit -m "Add apps.accounts: session-based login/logout/me/csrf endpoints"
git push origin main
```

---

### Task 3: `apps.content` permissions + serializers

**Files:**
- Create: `backend/apps/content/permissions.py`
- Create: `backend/apps/content/serializers.py`

- [ ] **Step 1: Write `apps/content/permissions.py`**

```python
from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
```

- [ ] **Step 2: Write `apps/content/serializers.py`**

```python
from rest_framework import serializers

from apps.content.models import (
    BlogPost,
    Certificate,
    Client,
    Contact,
    PortfolioItem,
    PricingPlan,
    Service,
    SiteContact,
    SocialLink,
    Stat,
    TeamMember,
    Testimonial,
)


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class StatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stat
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class SiteContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContact
        fields = "__all__"
        read_only_fields = ["id", "updated_at"]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
```

- [ ] **Step 3: Verify it imports cleanly**

Run: `cd backend && venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git add backend/apps/content/permissions.py backend/apps/content/serializers.py
git commit -m "Add content app permissions and serializers"
git push origin main
```

---

### Task 4: `apps.content` viewsets + contact/verify endpoints + routing

**Files:**
- Create: `backend/apps/content/views.py`
- Create: `backend/apps/content/urls.py`
- Modify: `backend/config/urls.py`
- Create: `backend/apps/content/tests/__init__.py`
- Create: `backend/apps/content/tests/test_api.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/apps/content/tests/test_api.py
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && venv\Scripts\python manage.py test apps.content.tests.test_api -v 2`
Expected: FAIL with a 404 (no `/api/content/` routes exist yet).

- [ ] **Step 3: Write `apps/content/views.py`**

```python
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.content.models import (
    BlogPost,
    Certificate,
    Client,
    Contact,
    PortfolioItem,
    PricingPlan,
    Service,
    SiteContact,
    SocialLink,
    Stat,
    TeamMember,
    Testimonial,
)
from apps.content.permissions import IsStaffOrReadOnly
from apps.content.serializers import (
    BlogPostSerializer,
    CertificateSerializer,
    ClientSerializer,
    ContactSerializer,
    PortfolioItemSerializer,
    PricingPlanSerializer,
    ServiceSerializer,
    SiteContactSerializer,
    SocialLinkSerializer,
    StatSerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
)


class ActiveFilteredViewSet(viewsets.ModelViewSet):
    """Non-staff users only see active=True rows; staff see everything."""

    active_field = "active"
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return queryset
        return queryset.filter(**{self.active_field: True})


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by("-created_at")
    serializer_class = ContactSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return self.queryset
        return self.queryset.none()


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all().order_by("-created_at")
    serializer_class = CertificateSerializer
    permission_classes = [IsStaffOrReadOnly]


class BlogPostViewSet(ActiveFilteredViewSet):
    queryset = BlogPost.objects.all().order_by("-created_at")
    serializer_class = BlogPostSerializer
    active_field = "published"


class TeamMemberViewSet(ActiveFilteredViewSet):
    queryset = TeamMember.objects.all().order_by("order")
    serializer_class = TeamMemberSerializer


class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all().order_by("order")
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsStaffOrReadOnly]


class StatViewSet(ActiveFilteredViewSet):
    queryset = Stat.objects.all().order_by("order")
    serializer_class = StatSerializer


class ClientViewSet(ActiveFilteredViewSet):
    queryset = Client.objects.all().order_by("order")
    serializer_class = ClientSerializer


class TestimonialViewSet(ActiveFilteredViewSet):
    queryset = Testimonial.objects.all().order_by("order")
    serializer_class = TestimonialSerializer


class ServiceViewSet(ActiveFilteredViewSet):
    queryset = Service.objects.all().order_by("order")
    serializer_class = ServiceSerializer


class PricingPlanViewSet(ActiveFilteredViewSet):
    queryset = PricingPlan.objects.all().order_by("order")
    serializer_class = PricingPlanSerializer


class SiteContactViewSet(viewsets.ModelViewSet):
    queryset = SiteContact.objects.all()
    serializer_class = SiteContactSerializer
    permission_classes = [IsStaffOrReadOnly]


class SocialLinkViewSet(ActiveFilteredViewSet):
    queryset = SocialLink.objects.all().order_by("order")
    serializer_class = SocialLinkSerializer


class ContactCreateView(APIView):
    """Public contact form submission - matches old app/api/contact/route.ts."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyCertificateView(APIView):
    """Public certificate lookup - matches old app/api/verify/route.ts."""

    permission_classes = [AllowAny]

    def get(self, request):
        cert_id = request.query_params.get("id", "").strip()
        if not cert_id:
            return Response(
                {"error": "Certificate ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            certificate = Certificate.objects.get(certificate_id=cert_id.upper())
        except Certificate.DoesNotExist:
            return Response(
                {"error": "Certificate not found. Please check the ID and try again."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"certificate": CertificateSerializer(certificate).data})
```

- [ ] **Step 4: Write `apps/content/urls.py`**

```python
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.content import views

router = DefaultRouter()
router.register("contacts", views.ContactViewSet, basename="contact")
router.register("certificates", views.CertificateViewSet, basename="certificate")
router.register("blog", views.BlogPostViewSet, basename="blogpost")
router.register("team", views.TeamMemberViewSet, basename="teammember")
router.register("portfolio", views.PortfolioItemViewSet, basename="portfolioitem")
router.register("stats", views.StatViewSet, basename="stat")
router.register("clients", views.ClientViewSet, basename="client")
router.register("testimonials", views.TestimonialViewSet, basename="testimonial")
router.register("services", views.ServiceViewSet, basename="service")
router.register("pricing", views.PricingPlanViewSet, basename="pricingplan")
router.register("site-contact", views.SiteContactViewSet, basename="sitecontact")
router.register("social-links", views.SocialLinkViewSet, basename="sociallink")

app_name = "content"

urlpatterns = [
    path("contact/", views.ContactCreateView.as_view(), name="contact-create"),
    path("verify/", views.VerifyCertificateView.as_view(), name="verify"),
    path("", include(router.urls)),
]
```

- [ ] **Step 5: Wire into `config/urls.py`**

```python
# backend/config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/content/", include("apps.content.urls")),
]
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `venv\Scripts\python manage.py test apps.content.tests.test_api -v 2`
Expected: `Ran 9 tests in X.XXXs` / `OK`

- [ ] **Step 7: Commit**

```bash
git add backend/apps/content/views.py backend/apps/content/urls.py backend/apps/content/tests backend/config/urls.py
git commit -m "Add content API viewsets, contact/verify endpoints, and routing"
git push origin main
```

---

### Task 5: Full backend suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend test suite**

Run: `cd backend && venv\Scripts\python manage.py test -v 2`
Expected: `Ran 31 tests in X.XXXs` / `OK` (16 from Milestone 1 + 6 accounts + 9 content API)

- [ ] **Step 2: Run Django system check**

Run: `venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Manual smoke test against the real dev server**

Run: `venv\Scripts\python manage.py runserver`

In another terminal:
```bash
curl http://localhost:8000/api/content/services/
curl http://localhost:8000/api/content/verify/
```
Expected: first returns `200` with a JSON array (only active services); second returns `400`
with `{"error": "Certificate ID is required"}`. Stop the dev server after checking (Ctrl+C).

- [ ] **Step 4: Commit (if any fixes were needed during verification)**

If Steps 1-3 required any fixes, commit them:
```bash
git add backend
git commit -m "Fix issues found during milestone 2 verification"
git push origin main
```
If no fixes were needed, skip this step — nothing to commit.

---

## Self-Review Notes

- **Spec coverage:** Public read / staff write matches the design spec's "Public read
  (list/retrieve) on published/active items; write access restricted to authenticated staff."
  `contact` and `verify` endpoints explicitly replace `app/api/contact/route.ts` and
  `app/api/verify/route.ts` per the spec. `apps.accounts` session auth replaces
  `lib/admin-auth.ts`'s static-cookie hack, per spec.
- **Type/name consistency:** `IsStaffOrReadOnly` used consistently across all viewsets;
  `ActiveFilteredViewSet.active_field` defaults to `"active"`, overridden to `"published"` only
  for `BlogPostViewSet` (the one model using that field name instead of `active`) — verified
  against Milestone 1's `apps/content/models.py` field names.
- **No placeholders:** every step has runnable code/commands. Certificate/Contact/PortfolioItem/
  SiteContact intentionally use plain `ModelViewSet` (no active-filtering) since those models
  have no `active`/`published` boolean in the schema.
