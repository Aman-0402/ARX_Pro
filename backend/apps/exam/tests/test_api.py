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

    def test_submit_at_exact_pass_mark_boundary_passes(self):
        questions = _make_questions(5)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.client.get(reverse("exam:questions"))

        # 3/5 = 60% exactly - should pass
        answers = {
            str(questions[0].id): "A",
            str(questions[1].id): "A",
            str(questions[2].id): "A",
        }
        response = self.client.post(
            reverse("exam:submit"), {"answers": answers}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["score"], 3)
        self.assertEqual(response.data["total"], 5)
        self.assertTrue(response.data["passed"])

    def test_submit_just_below_pass_mark_boundary_fails(self):
        questions = _make_questions(5)
        self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "jane@example.com", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.client.get(reverse("exam:questions"))

        # 2/5 = 40% - should fail
        answers = {
            str(questions[0].id): "A",
            str(questions[1].id): "A",
        }
        response = self.client.post(
            reverse("exam:submit"), {"answers": answers}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["score"], 2)
        self.assertFalse(response.data["passed"])

    def test_register_requires_all_fields(self):
        response = self.client.post(
            reverse("exam:register"),
            {"name": "Jane", "email": "", "voucher_code": "VOUCH-1"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ExamCandidate.objects.count(), 0)


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
