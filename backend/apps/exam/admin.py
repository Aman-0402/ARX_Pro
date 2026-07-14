from django.contrib import admin

from apps.exam.models import ExamCandidate, ExamQuestion, ExamResult, ExamVoucher

admin.site.register(ExamQuestion)
admin.site.register(ExamCandidate)
admin.site.register(ExamResult)
admin.site.register(ExamVoucher)
