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
