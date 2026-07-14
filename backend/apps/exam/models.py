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
