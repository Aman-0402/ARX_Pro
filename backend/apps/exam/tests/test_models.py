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
