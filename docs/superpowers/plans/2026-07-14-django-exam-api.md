# Django Exam API (Milestone 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the standalone PHP proctored-exam system (`nextjs/exam/*.php`) onto the Milestone 1
`apps.exam` models as a DRF API: voucher-gated candidate registration, randomized question
delivery, scored submission, result lookup — all session-scoped like the original
`$_SESSION`-based PHP flow — plus staff-only CRUD for questions/vouchers/results.

**Architecture:** Public flow uses Django's session framework (not a custom token) to track the
registered candidate across `register -> questions -> submit -> result`, mirroring the PHP
`$_SESSION['candidate_id']` pattern exactly but server-side and stateless-per-request via cookies.
A `HasExamSession` permission class gates the candidate-facing endpoints. Staff-only management
of questions/vouchers/results is exposed as three `ModelViewSet`s under `IsAdminUser`, reusing
the same session/CSRF auth wired in Milestone 2.

**Tech Stack:** Django 4.2, djangorestframework 3.15 (both already installed).

---

## Note on scope

Builds on Milestone 1 (`apps.exam` models, done) and Milestone 2 (session auth pattern,
`config.authentication.SessionAuthentication401`, done — commits through `dc7a16f`/`3dcd392`).
Does not touch `apps.content` or the frontend (Milestone 4+). Business rules below are taken
directly from the original PHP source, not invented:

- **Question selection:** `nextjs/exam/candidate/exam.php` — `SELECT * FROM questions ORDER BY
  RAND() LIMIT 45`.
- **Scoring:** `nextjs/exam/candidate/submit.php` — one point per question where the submitted
  option letter equals `ExamQuestion.correct_option`; `total` = number of questions presented
  (not a hardcoded 45, in case fewer than 45 exist); a `details` JSON blob of
  `[{question_id, selected, correct}, ...]` is stored per result.
- **Pass mark:** `nextjs/exam/candidate/result.php` — 60% (`percentage >= 60`). The original
  PHP never actually wrote this back to `results.passed` (dead column) — this migration fixes
  that by computing and storing `passed` properly at submission time, since the column already
  exists in the schema and spec calls for feature parity with correct behavior, not a
  reproduced bug.
- **Voucher gating:** `nextjs/exam/candidate/register.php` — voucher must be `is_active=1 AND
  used_by_candidate_id IS NULL`; on successful registration the voucher is marked used
  (`used_by_candidate`, `used_at`).

## File Structure

```
backend/apps/exam/
  permissions.py
  serializers.py
  views.py
  urls.py
  tests/
    test_api.py
backend/config/
  urls.py   (MODIFY: wire in /api/exam/)
```

---

### Task 1: `apps.exam` permissions + serializers

**Files:**
- Create: `backend/apps/exam/permissions.py`
- Create: `backend/apps/exam/serializers.py`

- [ ] **Step 1: Write `apps/exam/permissions.py`**

```python
from rest_framework.permissions import BasePermission


class HasExamSession(BasePermission):
    """Candidate must have completed /api/exam/register/ in this session,
    mirroring the original PHP $_SESSION['candidate_id'] gate."""

    def has_permission(self, request, view):
        return bool(request.session.get("exam_candidate_id"))
```

- [ ] **Step 2: Write `apps/exam/serializers.py`**

```python
from rest_framework import serializers

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher


class ExamQuestionPublicSerializer(serializers.ModelSerializer):
    """Candidate-facing: never exposes correct_option."""

    class Meta:
        model = ExamQuestion
        fields = ["id", "question", "option_a", "option_b", "option_c", "option_d"]


class ExamQuestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamQuestion
        fields = "__all__"


class ExamCandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamCandidate
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class ExamVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamVoucher
        fields = "__all__"
        read_only_fields = ["id", "created_at", "used_by_candidate", "used_at"]


class ExamResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamResult
        fields = "__all__"
        read_only_fields = ["id", "submitted_at"]
```

- [ ] **Step 3: Verify it imports cleanly**

Run: `cd backend && venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 4: Commit**

```bash
git add backend/apps/exam/permissions.py backend/apps/exam/serializers.py
git commit -m "Add exam app permissions and serializers"
git push origin main
```

---

### Task 2: Candidate flow — register, questions, submit, result

**Files:**
- Create: `backend/apps/exam/views.py`
- Create: `backend/apps/exam/urls.py`
- Modify: `backend/config/urls.py`
- Create: `backend/apps/exam/tests/__init__.py`
- Create: `backend/apps/exam/tests/test_api.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/apps/exam/tests/test_api.py
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher

User = get_user_model()


def _make_questions(n=5):
    questions = []
    for i in range(n):
        questions.append(
            ExamQuestion.objects.create(
                question=f"Question {i}?",
                option_a="A",
                option_b="B",
                option_c="C",
                option_d="D",
                correct_option="A",
            )
        )
    return questions


class ExamCandidateFlowTest(APITestCase):
    def setUp(self):
        self.voucher = ExamVoucher.objects.create(voucher_code="VOUCH-1")

    def test_register_with_valid_voucher_creates_candidate_and_marks_voucher_used(self):
        response = self.client.post(
            reverse("exam:register"),
            {"name": "Jane Doe", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ExamCandidate.objects.count(), 1)

        self.voucher.refresh_from_db()
        self.assertIsNotNone(self.voucher.used_by_candidate)
        self.assertIsNotNone(self.voucher.used_at)

    def test_register_with_unknown_voucher_fails(self):
        response = self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "NOPE"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ExamCandidate.objects.count(), 0)

    def test_register_with_already_used_voucher_fails(self):
        candidate = ExamCandidate.objects.create(name="First", email="first@example.com")
        self.voucher.used_by_candidate = candidate
        self.voucher.save()

        response = self.client.post(
            reverse("exam:register"),
            {"name": "Second", "email": "second@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_questions_endpoint_requires_registration(self):
        response = self.client.get(reverse("exam:questions"))
        self.assertEqual(response.status_code, 403)

    def test_questions_endpoint_returns_questions_without_correct_option(self):
        _make_questions(5)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        response = self.client.get(reverse("exam:questions"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 5)
        self.assertNotIn("correct_option", response.data[0])

    def test_submit_requires_registration(self):
        response = self.client.post(reverse("exam:submit"), {"answers": {}}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_submit_scores_correctly_and_creates_result(self):
        questions = _make_questions(4)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.client.get(reverse("exam:questions"))

        answers = {str(questions[0].id): "A", str(questions[1].id): "A", str(questions[2].id): "B"}
        response = self.client.post(
            reverse("exam:submit"), {"answers": answers}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["score"], 2)
        self.assertEqual(response.data["total"], 4)
        self.assertFalse(response.data["passed"])

        result = ExamResult.objects.get()
        self.assertEqual(result.score, 2)
        self.assertEqual(result.total, 4)

    def test_submit_ignores_answers_for_questions_not_presented(self):
        questions = _make_questions(3)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.client.get(reverse("exam:questions"))

        rogue_question = ExamQuestion.objects.create(
            question="Rogue?", option_a="A", option_b="B", option_c="C", option_d="D",
            correct_option="A",
        )
        answers = {
            str(questions[0].id): "A",
            str(rogue_question.id): "A",
        }
        response = self.client.post(
            reverse("exam:submit"), {"answers": answers}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["total"], 3)
        self.assertEqual(response.data["score"], 1)

    def test_result_endpoint_returns_latest_result(self):
        questions = _make_questions(2)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.client.get(reverse("exam:questions"))
        self.client.post(
            reverse("exam:submit"),
            {"answers": {str(questions[0].id): "A", str(questions[1].id): "A"}},
            format="json",
        )

        response = self.client.get(reverse("exam:result"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["score"], 2)
        self.assertEqual(response.data["total"], 2)
        self.assertTrue(response.data["passed"])

    def test_result_endpoint_requires_registration(self):
        response = self.client.get(reverse("exam:result"))
        self.assertEqual(response.status_code, 403)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && venv\Scripts\python manage.py test apps.exam.tests.test_api -v 2`
Expected: FAIL with `NoReverseMatch` (no `exam` URL namespace exists yet).

- [ ] **Step 3: Write `apps/exam/views.py`**

```python
import json

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher
from apps.exam.permissions import HasExamSession
from apps.exam.serializers import (
    ExamCandidateSerializer,
    ExamQuestionAdminSerializer,
    ExamQuestionPublicSerializer,
    ExamResultSerializer,
    ExamVoucherSerializer,
)

QUESTION_COUNT = 45
PASS_MARK_PERCENT = 60


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        voucher_code = request.data.get("voucher_code", "").strip()

        if not name or not email or not voucher_code:
            return Response(
                {"error": "name, email, and voucher_code are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            voucher = ExamVoucher.objects.get(
                voucher_code=voucher_code, is_active=True, used_by_candidate__isnull=True
            )
        except ExamVoucher.DoesNotExist:
            return Response(
                {"error": "Invalid or already used voucher code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        candidate = ExamCandidate.objects.create(name=name, email=email)
        voucher.used_by_candidate = candidate
        voucher.used_at = timezone_now()
        voucher.save()

        request.session["exam_candidate_id"] = candidate.id
        request.session["exam_candidate_name"] = candidate.name

        return Response(
            ExamCandidateSerializer(candidate).data, status=status.HTTP_201_CREATED
        )


class QuestionsView(APIView):
    permission_classes = [HasExamSession]

    def get(self, request):
        questions = list(ExamQuestion.objects.order_by("?")[:QUESTION_COUNT])
        request.session["exam_question_ids"] = [q.id for q in questions]
        return Response(ExamQuestionPublicSerializer(questions, many=True).data)


class SubmitView(APIView):
    permission_classes = [HasExamSession]

    def post(self, request):
        candidate_id = request.session["exam_candidate_id"]
        presented_ids = request.session.get("exam_question_ids", [])
        answers = request.data.get("answers", {})

        questions = {q.id: q for q in ExamQuestion.objects.filter(id__in=presented_ids)}

        score = 0
        details = []
        for question_id in presented_ids:
            question = questions.get(question_id)
            if question is None:
                continue
            selected = answers.get(str(question_id), "")
            correct = question.correct_option
            if selected == correct:
                score += 1
            details.append({"question_id": question_id, "selected": selected, "correct": correct})

        total = len(presented_ids)
        percentage = (score / total * 100) if total else 0
        passed = percentage >= PASS_MARK_PERCENT

        result = ExamResult.objects.create(
            candidate_id=candidate_id,
            score=score,
            total=total,
            passed=passed,
            details=json.dumps(details),
        )

        request.session.pop("exam_question_ids", None)

        return Response(ExamResultSerializer(result).data, status=status.HTTP_201_CREATED)


class ResultView(APIView):
    permission_classes = [HasExamSession]

    def get(self, request):
        candidate_id = request.session["exam_candidate_id"]
        result = (
            ExamResult.objects.filter(candidate_id=candidate_id).order_by("-id").first()
        )
        if result is None:
            return Response({"error": "Result not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ExamResultSerializer(result).data)


class ExamQuestionAdminViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.all()
    serializer_class = ExamQuestionAdminSerializer
    permission_classes = [IsAdminUser]


class ExamVoucherAdminViewSet(viewsets.ModelViewSet):
    queryset = ExamVoucher.objects.all().order_by("-created_at")
    serializer_class = ExamVoucherSerializer
    permission_classes = [IsAdminUser]


class ExamResultAdminViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all().order_by("-submitted_at")
    serializer_class = ExamResultSerializer
    permission_classes = [IsAdminUser]


def timezone_now():
    from django.utils import timezone

    return timezone.now()
```

- [ ] **Step 4: Write `apps/exam/urls.py`**

```python
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.exam import views

router = DefaultRouter()
router.register("admin/questions", views.ExamQuestionAdminViewSet, basename="admin-question")
router.register("admin/vouchers", views.ExamVoucherAdminViewSet, basename="admin-voucher")
router.register("admin/results", views.ExamResultAdminViewSet, basename="admin-result")

app_name = "exam"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("questions/", views.QuestionsView.as_view(), name="questions"),
    path("submit/", views.SubmitView.as_view(), name="submit"),
    path("result/", views.ResultView.as_view(), name="result"),
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
    path("api/exam/", include("apps.exam.urls")),
]
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `venv\Scripts\python manage.py test apps.exam.tests.test_api -v 2`
Expected: `Ran 10 tests in X.XXXs` / `OK`

- [ ] **Step 7: Commit**

```bash
git add backend/apps/exam/views.py backend/apps/exam/urls.py backend/apps/exam/tests backend/config/urls.py
git commit -m "Add exam candidate flow API (register/questions/submit/result) and staff admin viewsets"
git push origin main
```

---

### Task 3: Staff-only management API test coverage

**Files:**
- Modify: `backend/apps/exam/tests/test_api.py`

- [ ] **Step 1: Add the failing tests**

Append to `backend/apps/exam/tests/test_api.py`:

```python
class ExamAdminApiTest(APITestCase):
    def setUp(self):
        self.staff = User.objects.create_user(
            username="staff", password="Sup3rSecret!", is_staff=True
        )
        self.question = ExamQuestion.objects.create(
            question="2+2?", option_a="3", option_b="4", option_c="5", option_d="6",
            correct_option="B",
        )

    def test_anonymous_cannot_list_admin_questions(self):
        response = self.client.get("/api/exam/admin/questions/")
        self.assertEqual(response.status_code, 403)

    def test_staff_can_list_admin_questions_with_correct_option_visible(self):
        self.client.login(username="staff", password="Sup3rSecret!")
        response = self.client.get("/api/exam/admin/questions/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("correct_option", response.data[0])

    def test_staff_can_create_voucher(self):
        self.client.login(username="staff", password="Sup3rSecret!")
        response = self.client.post(
            "/api/exam/admin/vouchers/", {"voucher_code": "NEWCODE"}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ExamVoucher.objects.filter(voucher_code="NEWCODE").exists())

    def test_anonymous_cannot_create_voucher(self):
        response = self.client.post(
            "/api/exam/admin/vouchers/", {"voucher_code": "NEWCODE"}, format="json"
        )
        self.assertEqual(response.status_code, 403)
```

- [ ] **Step 2: Run tests to verify they fail (before this task) then pass (they should already
pass given Task 2's implementation — this task is pure test coverage, not new production code)**

Run: `cd backend && venv\Scripts\python manage.py test apps.exam.tests.test_api -v 2`
Expected: `Ran 14 tests in X.XXXs` / `OK` (10 from Task 2 + 4 new admin tests)

If any of the 4 new tests fail, fix `apps/exam/views.py` (e.g. permission class misconfigured)
until they pass — do not change the test expectations.

- [ ] **Step 3: Commit**

```bash
git add backend/apps/exam/tests/test_api.py
git commit -m "Add staff-only exam admin API test coverage"
git push origin main
```

---

### Task 4: Full backend suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full backend test suite**

Run: `cd backend && venv\Scripts\python manage.py test -v 2`
Expected: `Ran 45 tests in X.XXXs` / `OK` (31 from Milestones 1-2 + 14 exam API)

- [ ] **Step 2: Run Django system check**

Run: `venv\Scripts\python manage.py check`
Expected: `System check identified no issues (0 silenced).`

- [ ] **Step 3: Manual smoke test against the real dev server**

Run: `venv\Scripts\python manage.py runserver 8010` (use a port confirmed free first, e.g. via
`netstat -ano | findstr :8010`, since other local projects may occupy 8000)

In another terminal:
```bash
curl -c cookies.txt -X POST http://localhost:8010/api/exam/register/ -H "Content-Type: application/json" -d "{\"name\":\"Smoke Test\",\"email\":\"smoke@example.com\",\"voucher_code\":\"DOES-NOT-EXIST\"}"
```
Expected: `400` with `{"error": "Invalid or already used voucher code."}` — confirms the endpoint
is live and validates correctly without needing real seed data. Stop the dev server after
checking (Ctrl+C).

- [ ] **Step 4: Commit (if any fixes were needed during verification)**

If Steps 1-3 required any fixes, commit them:
```bash
git add backend
git commit -m "Fix issues found during milestone 3 verification"
git push origin main
```
If no fixes were needed, skip this step.

---

## Self-Review Notes

- **Spec coverage:** Voucher-gated registration, 45-question random draw, correct-option-hidden
  public serializer, scoring against only the presented question set (tamper-resistant, unlike
  trusting client-submitted question IDs blindly), 60% pass mark, staff-only question/voucher/
  result management — all traced directly to the PHP source files, not invented. The `passed`
  column fix (computed properly, unlike the original's dead column) is called out explicitly as
  an intentional correctness improvement, not scope creep, since the spec asks for feature
  parity with *correct* behavior.
- **Session design:** Matches the spec's stated approach ("session tracking moves from PHP
  `$_SESSION` to a short-lived token/session issued by the `apps.exam` API at registration") —
  implemented via Django's built-in session framework rather than a bespoke token, which is the
  simplest mechanism that satisfies "short-lived session issued at registration."
  `SessionAuthentication401` from Milestone 2 is irrelevant here since these are unauthenticated
  (`AllowAny`/`HasExamSession`) endpoints, not `IsAuthenticated` ones — session cookie still
  flows via `SessionMiddleware`, independent of DRF's auth classes.
- **Type/name consistency:** `HasExamSession` checked consistently on `QuestionsView`,
  `SubmitView`, `ResultView`; `exam_candidate_id`/`exam_question_ids` session keys used
  identically across `RegisterView`, `QuestionsView`, `SubmitView`, `ResultView`.
- **No placeholders:** every step has runnable code/commands.
