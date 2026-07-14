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
