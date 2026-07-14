import json

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication
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
        voucher.used_at = timezone.now()
        voucher.save()

        request.session["exam_candidate_id"] = candidate.id
        request.session["exam_candidate_name"] = candidate.name

        return Response(
            ExamCandidateSerializer(candidate).data, status=status.HTTP_201_CREATED
        )


class QuestionsView(APIView):
    authentication_classes = []
    permission_classes = [HasExamSession]

    def get(self, request):
        questions = list(ExamQuestion.objects.order_by("?")[:QUESTION_COUNT])
        request.session["exam_question_ids"] = [q.id for q in questions]
        return Response(ExamQuestionPublicSerializer(questions, many=True).data)


class SubmitView(APIView):
    authentication_classes = []
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
    authentication_classes = []
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
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]


class ExamVoucherAdminViewSet(viewsets.ModelViewSet):
    queryset = ExamVoucher.objects.all().order_by("-created_at")
    serializer_class = ExamVoucherSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]


class ExamResultAdminViewSet(viewsets.ModelViewSet):
    queryset = ExamResult.objects.all().order_by("-submitted_at")
    serializer_class = ExamResultSerializer
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]
