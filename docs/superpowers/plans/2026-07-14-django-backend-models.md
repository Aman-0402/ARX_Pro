# Django Backend Scaffold + Models (Milestone 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Django + DRF project in `/backend`, with all 16 data models (12 content
models + 4 exam models) ported 1:1 from `nextjs/prisma/schema.prisma`, migrated against MySQL,
and registered in Django admin.

**Architecture:** Two Django apps — `apps.content` (site/CMS models) and `apps.exam` (exam
module models) — inside a `config` project package. `django-environ` parses the same
`DATABASE_URL` shape used by the Next.js app. This is milestone 1 of the migration
(`docs/superpowers/specs/2026-07-14-nextjs-to-django-react-migration-design.md`); DRF
serializers/viewsets/auth come in the next plan.

**Tech Stack:** Python 3.12, Django 5, djangorestframework, mysqlclient, django-environ,
django-cors-headers.

---

## Note on scope

This plan covers spec milestone 1 only (Django scaffold + models). Milestones 2–10
(API layer, exam API, frontend scaffold, page ports, cleanup, docs) will be separate plans —
each produces working, testable software on its own, per the spec's milestone breakdown.

## File Structure

```
backend/
  manage.py
  requirements.txt
  .env.example
  config/
    __init__.py
    settings.py
    urls.py
    wsgi.py
    asgi.py
  apps/
    __init__.py
    content/
      __init__.py
      apps.py
      models.py
      admin.py
      migrations/
        __init__.py
      tests/
        __init__.py
        test_models.py
    exam/
      __init__.py
      apps.py
      models.py
      admin.py
      migrations/
        __init__.py
      tests/
        __init__.py
        test_models.py
```

---

### Task 1: Project scaffold + settings

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/manage.py`
- Create: `backend/config/__init__.py`
- Create: `backend/config/settings.py`
- Create: `backend/config/urls.py`
- Create: `backend/config/wsgi.py`
- Create: `backend/config/asgi.py`
- Create: `backend/apps/__init__.py`

- [ ] **Step 1: Create requirements.txt**

```text
Django==5.1.4
djangorestframework==3.15.2
mysqlclient==2.2.7
django-environ==0.11.2
django-cors-headers==4.6.0
```

- [ ] **Step 2: Install dependencies**

Run: `cd backend && python -m venv venv && venv\Scripts\pip install -r requirements.txt`
Expected: packages install without error (mysqlclient needs a MySQL client library available
on the system — if the install fails on Windows, use
`pip install mysqlclient --only-binary :all:` or install the MySQL C connector first).

- [ ] **Step 3: Create `.env.example`**

```env
DATABASE_URL=mysql://root@localhost:3306/arx
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Copy it to `.env` for local dev: `cp backend/.env.example backend/.env` (same `DATABASE_URL`
value as `nextjs/.env.local`, so both apps can point at the same local MySQL DB during
migration).

- [ ] **Step 4: Create `config/settings.py`**

```python
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-secret-key")
DEBUG = env.bool("DJANGO_DEBUG", default=True)
ALLOWED_HOSTS = ["*"] if DEBUG else []

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.content",
    "apps.exam",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {"default": env.db("DATABASE_URL")}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:5173"])

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
}
```

- [ ] **Step 5: Create `config/urls.py`**

```python
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
```

- [ ] **Step 6: Create `config/wsgi.py`**

```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
application = get_wsgi_application()
```

- [ ] **Step 7: Create `config/asgi.py`**

```python
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
application = get_asgi_application()
```

- [ ] **Step 8: Create `manage.py`**

```python
#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
```

- [ ] **Step 9: Create empty `config/__init__.py` and `apps/__init__.py`**

Both files are empty (mark the directories as Python packages).

- [ ] **Step 10: Verify the project boots**

Run: `cd backend && venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 11: Commit**

```bash
git add backend/manage.py backend/requirements.txt backend/.env.example backend/config
git commit -m "Scaffold Django project with MySQL settings"
git push origin main
```

---

### Task 2: `apps.content` models

**Files:**
- Create: `backend/apps/content/__init__.py`
- Create: `backend/apps/content/apps.py`
- Create: `backend/apps/content/models.py`
- Create: `backend/apps/content/tests/__init__.py`
- Create: `backend/apps/content/tests/test_models.py`
- Create: `backend/apps/content/migrations/__init__.py`

- [ ] **Step 1: Create `apps/content/apps.py`**

```python
from django.apps import AppConfig


class ContentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.content"
    label = "content"
```

- [ ] **Step 2: Create empty `apps/content/__init__.py`, `apps/content/migrations/__init__.py`,
`apps/content/tests/__init__.py`**

All three files are empty.

- [ ] **Step 3: Write the failing test**

```python
# backend/apps/content/tests/test_models.py
from django.test import TestCase

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


class ContentModelsTest(TestCase):
    def test_contact_create_and_str_fields(self):
        contact = Contact.objects.create(
            name="Jane Doe",
            email="jane@example.com",
            subject="Question",
            message="Hello there",
        )
        self.assertEqual(Contact.objects.count(), 1)
        self.assertIsNone(contact.phone)

    def test_certificate_unique_certificate_id(self):
        Certificate.objects.create(
            certificate_id="CERT-001",
            holder_name="John Smith",
            course_name="Cloud Fundamentals",
            issue_date="2026-01-01",
        )
        self.assertTrue(
            Certificate.objects.filter(certificate_id="CERT-001", is_valid=True).exists()
        )

    def test_blog_post_defaults(self):
        post = BlogPost.objects.create(
            slug="hello-world",
            title="Hello World",
            excerpt="Intro",
            content="Full content",
            category="News",
            author="ARX Team",
        )
        self.assertFalse(post.published)
        self.assertIsNone(post.published_at)

    def test_team_member_ordering_defaults(self):
        member = TeamMember.objects.create(name="Alice", role="Engineer")
        self.assertEqual(member.order, 0)
        self.assertTrue(member.active)

    def test_portfolio_item_unique_slug(self):
        PortfolioItem.objects.create(
            title="Project X",
            slug="project-x",
            category="Web",
            description="A project",
        )
        self.assertEqual(PortfolioItem.objects.count(), 1)

    def test_stat_defaults(self):
        stat = Stat.objects.create(target=100, suffix="+", label="Clients")
        self.assertEqual(stat.icon, "users")
        self.assertTrue(stat.active)

    def test_client_defaults(self):
        client = Client.objects.create(name="Acme Corp")
        self.assertEqual(client.order, 0)
        self.assertTrue(client.active)

    def test_testimonial_default_stars(self):
        testimonial = Testimonial.objects.create(
            name="Bob", company="Acme", text="Great service"
        )
        self.assertEqual(testimonial.stars, 5)

    def test_service_defaults(self):
        service = Service.objects.create(title="Cloud Migration", description="We migrate")
        self.assertEqual(service.icon, "briefcase")

    def test_pricing_plan_defaults(self):
        plan = PricingPlan.objects.create(
            name="Starter",
            tagline="For small teams",
            price="$99",
            period="month",
            features="Feature A\nFeature B",
        )
        self.assertEqual(plan.badge_variant, "gold")
        self.assertEqual(plan.button_label, "Get Quote")
        self.assertFalse(plan.highlight)

    def test_site_contact_singleton_style_create(self):
        contact = SiteContact.objects.create(
            address="123 Street", phone="+1 555 0100", email="info@arxinfo.tech"
        )
        self.assertIsNone(contact.whatsapp)

    def test_social_link_defaults(self):
        link = SocialLink.objects.create(
            platform="linkedin", label="LinkedIn", url="https://linkedin.com/company/arx"
        )
        self.assertEqual(link.order, 0)
        self.assertTrue(link.active)
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd backend && venv\Scripts\python manage.py test apps.content -v 2`
Expected: FAIL with `ModuleNotFoundError: No module named 'apps.content.models'` (models.py
doesn't exist yet).

- [ ] **Step 5: Write `apps/content/models.py`**

```python
from django.db import models


class Contact(models.Model):
    name = models.CharField(max_length=150)
    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "contacts"

    def __str__(self):
        return f"{self.name} - {self.subject}"


class Certificate(models.Model):
    certificate_id = models.CharField(max_length=100, unique=True, db_column="certificate_id")
    holder_name = models.CharField(max_length=150, db_column="holder_name")
    course_name = models.CharField(max_length=255, db_column="course_name")
    issue_date = models.DateField(db_column="issue_date")
    expiry_date = models.DateField(null=True, blank=True, db_column="expiry_date")
    is_valid = models.BooleanField(default=True, db_column="is_valid")
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "certificates"

    def __str__(self):
        return self.certificate_id


class BlogPost(models.Model):
    slug = models.SlugField(max_length=255, unique=True)
    title = models.CharField(max_length=500)
    excerpt = models.TextField()
    content = models.TextField()
    cover_image = models.CharField(max_length=500, null=True, blank=True, db_column="cover_image")
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=500, null=True, blank=True)
    author = models.CharField(max_length=150)
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True, db_column="published_at")
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")
    updated_at = models.DateTimeField(auto_now=True, db_column="updated_at")

    class Meta:
        db_table = "blog_posts"

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    bio = models.TextField(null=True, blank=True)
    photo = models.CharField(max_length=500, null=True, blank=True)
    linkedin = models.CharField(max_length=500, null=True, blank=True)
    twitter = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "team_members"

    def __str__(self):
        return self.name


class PortfolioItem(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    content = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=500, null=True, blank=True)
    tags = models.CharField(max_length=500, null=True, blank=True)
    client_name = models.CharField(max_length=255, null=True, blank=True, db_column="client_name")
    live_url = models.CharField(max_length=500, null=True, blank=True, db_column="live_url")
    featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "portfolio_items"

    def __str__(self):
        return self.title


class Stat(models.Model):
    icon = models.CharField(max_length=100, default="users")
    target = models.IntegerField()
    suffix = models.CharField(max_length=20)
    label = models.CharField(max_length=150)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "stats"

    def __str__(self):
        return self.label


class Client(models.Model):
    name = models.CharField(max_length=255)
    logo = models.CharField(max_length=500, null=True, blank=True)
    website = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "clients"

    def __str__(self):
        return self.name


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=150, null=True, blank=True)
    text = models.TextField()
    stars = models.FloatField(default=5)
    avatar = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "testimonials"

    def __str__(self):
        return f"{self.name} ({self.company})"


class Service(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, default="briefcase")
    image = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "services"

    def __str__(self):
        return self.title


class PricingPlan(models.Model):
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=255)
    price = models.CharField(max_length=50)
    period = models.CharField(max_length=50)
    badge = models.CharField(max_length=100, null=True, blank=True)
    badge_variant = models.CharField(max_length=20, default="gold", db_column="badge_variant")
    highlight = models.BooleanField(default=False)
    features = models.TextField()
    button_label = models.CharField(max_length=100, default="Get Quote", db_column="button_label")
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "pricing_plans"

    def __str__(self):
        return self.name


class SiteContact(models.Model):
    address = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.CharField(max_length=150)
    whatsapp = models.CharField(max_length=50, null=True, blank=True)
    map_embed = models.TextField(null=True, blank=True, db_column="map_embed")
    updated_at = models.DateTimeField(auto_now=True, db_column="updated_at")

    class Meta:
        db_table = "site_contact"

    def __str__(self):
        return self.email


class SocialLink(models.Model):
    platform = models.CharField(max_length=50)
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=500)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "social_links"

    def __str__(self):
        return f"{self.platform}: {self.label}"
```

- [ ] **Step 6: Generate and apply migrations**

Run: `cd backend && venv\Scripts\python manage.py makemigrations content`
Expected: `Migrations for 'content': apps\content\migrations\0001_initial.py` listing all 12
models.

Run: `venv\Scripts\python manage.py migrate`
Expected: all `content.0001_initial` operations apply with no errors (requires the MySQL DB
from `DATABASE_URL` to be reachable — start MySQL locally first if needed).

- [ ] **Step 7: Run tests to verify they pass**

Run: `venv\Scripts\python manage.py test apps.content -v 2`
Expected: `Ran 12 tests in X.XXXs` / `OK`

- [ ] **Step 8: Commit**

```bash
git add backend/apps/content
git commit -m "Add content app models (12 CMS models ported from Prisma schema)"
git push origin main
```

---

### Task 3: `apps.content` admin registration

**Files:**
- Create: `backend/apps/content/admin.py`

- [ ] **Step 1: Write `apps/content/admin.py`**

```python
from django.contrib import admin

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

admin.site.register(Contact)
admin.site.register(Certificate)
admin.site.register(BlogPost)
admin.site.register(TeamMember)
admin.site.register(PortfolioItem)
admin.site.register(Stat)
admin.site.register(Client)
admin.site.register(Testimonial)
admin.site.register(Service)
admin.site.register(PricingPlan)
admin.site.register(SiteContact)
admin.site.register(SocialLink)
```

- [ ] **Step 2: Verify admin loads without error**

Run: `cd backend && venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Commit**

```bash
git add backend/apps/content/admin.py
git commit -m "Register content models in Django admin"
git push origin main
```

---

### Task 4: `apps.exam` models

**Files:**
- Create: `backend/apps/exam/__init__.py`
- Create: `backend/apps/exam/apps.py`
- Create: `backend/apps/exam/models.py`
- Create: `backend/apps/exam/tests/__init__.py`
- Create: `backend/apps/exam/tests/test_models.py`
- Create: `backend/apps/exam/migrations/__init__.py`

- [ ] **Step 1: Create `apps/exam/apps.py`**

```python
from django.apps import AppConfig


class ExamConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.exam"
    label = "exam"
```

- [ ] **Step 2: Create empty `apps/exam/__init__.py`, `apps/exam/migrations/__init__.py`,
`apps/exam/tests/__init__.py`**

All three files are empty.

- [ ] **Step 3: Write the failing test**

```python
# backend/apps/exam/tests/test_models.py
from django.test import TestCase

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher


class ExamModelsTest(TestCase):
    def test_exam_question_create(self):
        question = ExamQuestion.objects.create(
            question="What is 2 + 2?",
            option_a="3",
            option_b="4",
            option_c="5",
            option_d="6",
            correct_option="B",
        )
        self.assertEqual(ExamQuestion.objects.count(), 1)
        self.assertEqual(question.correct_option, "B")

    def test_exam_candidate_create(self):
        candidate = ExamCandidate.objects.create(name="Jane Doe", email="jane@example.com")
        self.assertEqual(ExamCandidate.objects.count(), 1)

    def test_exam_result_linked_to_candidate(self):
        candidate = ExamCandidate.objects.create(name="John Doe", email="john@example.com")
        result = ExamResult.objects.create(
            candidate=candidate, score=30, total=45, passed=True
        )
        self.assertEqual(candidate.results.count(), 1)
        self.assertEqual(result.candidate, candidate)

    def test_exam_voucher_defaults_and_usage(self):
        voucher = ExamVoucher.objects.create(voucher_code="VOUCHER-001")
        self.assertTrue(voucher.is_active)
        self.assertIsNone(voucher.used_by_candidate)

        candidate = ExamCandidate.objects.create(name="Amy", email="amy@example.com")
        voucher.used_by_candidate = candidate
        voucher.save()
        voucher.refresh_from_db()
        self.assertEqual(voucher.used_by_candidate, candidate)
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd backend && venv\Scripts\python manage.py test apps.exam -v 2`
Expected: FAIL with `ModuleNotFoundError: No module named 'apps.exam.models'`.

- [ ] **Step 5: Write `apps/exam/models.py`**

```python
from django.db import models


class ExamQuestion(models.Model):
    question = models.TextField()
    option_a = models.CharField(max_length=255, db_column="option_a")
    option_b = models.CharField(max_length=255, db_column="option_b")
    option_c = models.CharField(max_length=255, db_column="option_c")
    option_d = models.CharField(max_length=255, db_column="option_d")
    correct_option = models.CharField(max_length=1, db_column="correct_option")

    class Meta:
        db_table = "exam_questions"

    def __str__(self):
        return self.question[:50]


class ExamCandidate(models.Model):
    name = models.CharField(max_length=150)
    email = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "exam_candidates"

    def __str__(self):
        return f"{self.name} <{self.email}>"


class ExamResult(models.Model):
    candidate = models.ForeignKey(
        ExamCandidate,
        on_delete=models.CASCADE,
        related_name="results",
        db_column="candidate_id",
    )
    score = models.IntegerField()
    total = models.IntegerField()
    passed = models.BooleanField(default=False)
    details = models.TextField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_column="submitted_at")

    class Meta:
        db_table = "exam_results"

    def __str__(self):
        return f"{self.candidate} - {self.score}/{self.total}"


class ExamVoucher(models.Model):
    voucher_code = models.CharField(max_length=100, unique=True, db_column="voucher_code")
    is_active = models.BooleanField(default=True, db_column="is_active")
    used_by_candidate = models.ForeignKey(
        ExamCandidate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="used_by_candidate_id",
    )
    used_at = models.DateTimeField(null=True, blank=True, db_column="used_at")
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "exam_vouchers"

    def __str__(self):
        return self.voucher_code
```

- [ ] **Step 6: Generate and apply migrations**

Run: `cd backend && venv\Scripts\python manage.py makemigrations exam`
Expected: `Migrations for 'exam': apps\exam\migrations\0001_initial.py` listing all 4 models.

Run: `venv\Scripts\python manage.py migrate`
Expected: `exam.0001_initial` operations apply with no errors.

- [ ] **Step 7: Run tests to verify they pass**

Run: `venv\Scripts\python manage.py test apps.exam -v 2`
Expected: `Ran 4 tests in X.XXXs` / `OK`

- [ ] **Step 8: Commit**

```bash
git add backend/apps/exam
git commit -m "Add exam app models (question, candidate, result, voucher)"
git push origin main
```

---

### Task 5: `apps.exam` admin registration + full test suite verification

**Files:**
- Create: `backend/apps/exam/admin.py`

- [ ] **Step 1: Write `apps/exam/admin.py`**

```python
from django.contrib import admin

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher

admin.site.register(ExamQuestion)
admin.site.register(ExamCandidate)
admin.site.register(ExamResult)
admin.site.register(ExamVoucher)
```

- [ ] **Step 2: Run the full backend test suite**

Run: `cd backend && venv\Scripts\python manage.py test -v 2`
Expected: `Ran 16 tests in X.XXXs` / `OK` (12 content + 4 exam)

- [ ] **Step 3: Run Django system check one more time**

Run: `venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git add backend/apps/exam/admin.py
git commit -m "Register exam models in Django admin; milestone 1 complete"
git push origin main
```

---

## Self-Review Notes

- **Spec coverage:** All 12 content models and 4 exam models from the spec's data-model section
  are implemented with matching field names/types/constraints (unique `certificate_id`,
  unique `slug` on `BlogPost`/`PortfolioItem`, unique `voucher_code`, FK from `ExamResult` to
  `ExamCandidate`, nullable FK from `ExamVoucher` to `ExamCandidate` replacing the raw
  `used_by_candidate_id` int column). `ExamAdmin` is intentionally omitted per spec
  ("superseded by Django `User` + is_staff") — handled in the next plan (accounts/auth).
- **Type consistency:** `used_by_candidate` field name is used consistently in both the model
  (Task 4, Step 5) and its test (Task 4, Step 3).
- **No placeholders:** every step has runnable code/commands.
