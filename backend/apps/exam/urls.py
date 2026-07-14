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
