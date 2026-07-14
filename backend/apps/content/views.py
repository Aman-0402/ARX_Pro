from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

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
from apps.content.permissions import IsStaffOrReadOnly
from apps.content.serializers import (
    BlogPostSerializer,
    CertificateSerializer,
    ClientSerializer,
    ContactSerializer,
    PortfolioItemSerializer,
    PricingPlanSerializer,
    ServiceSerializer,
    SiteContactSerializer,
    SocialLinkSerializer,
    StatSerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
)


class ActiveFilteredViewSet(viewsets.ModelViewSet):
    """Non-staff users only see active=True rows; staff see everything."""

    active_field = "active"
    permission_classes = [IsStaffOrReadOnly]

    def permission_denied(self, request, message=None, code=None):
        # DRF's default APIView.permission_denied() escalates to 401
        # whenever any authenticator is configured, regardless of whether
        # the request actually carried credentials. We want a plain 403
        # for anonymous writes (session auth for staff logins still works
        # normally via the configured authenticators).
        raise PermissionDenied(detail=message, code=code)

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            return queryset
        return queryset.filter(**{self.active_field: True})


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by("-created_at")
    serializer_class = ContactSerializer
    permission_classes = [IsStaffOrReadOnly]

    def permission_denied(self, request, message=None, code=None):
        raise PermissionDenied(detail=message, code=code)

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return self.queryset
        return self.queryset.none()


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all().order_by("-created_at")
    serializer_class = CertificateSerializer
    permission_classes = [IsStaffOrReadOnly]

    def permission_denied(self, request, message=None, code=None):
        raise PermissionDenied(detail=message, code=code)


class BlogPostViewSet(ActiveFilteredViewSet):
    queryset = BlogPost.objects.all().order_by("-created_at")
    serializer_class = BlogPostSerializer
    active_field = "published"


class TeamMemberViewSet(ActiveFilteredViewSet):
    queryset = TeamMember.objects.all().order_by("order")
    serializer_class = TeamMemberSerializer


class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all().order_by("order")
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsStaffOrReadOnly]

    def permission_denied(self, request, message=None, code=None):
        raise PermissionDenied(detail=message, code=code)


class StatViewSet(ActiveFilteredViewSet):
    queryset = Stat.objects.all().order_by("order")
    serializer_class = StatSerializer


class ClientViewSet(ActiveFilteredViewSet):
    queryset = Client.objects.all().order_by("order")
    serializer_class = ClientSerializer


class TestimonialViewSet(ActiveFilteredViewSet):
    queryset = Testimonial.objects.all().order_by("order")
    serializer_class = TestimonialSerializer


class ServiceViewSet(ActiveFilteredViewSet):
    queryset = Service.objects.all().order_by("order")
    serializer_class = ServiceSerializer


class PricingPlanViewSet(ActiveFilteredViewSet):
    queryset = PricingPlan.objects.all().order_by("order")
    serializer_class = PricingPlanSerializer


class SiteContactViewSet(viewsets.ModelViewSet):
    queryset = SiteContact.objects.all()
    serializer_class = SiteContactSerializer
    permission_classes = [IsStaffOrReadOnly]

    def permission_denied(self, request, message=None, code=None):
        raise PermissionDenied(detail=message, code=code)


class SocialLinkViewSet(ActiveFilteredViewSet):
    queryset = SocialLink.objects.all().order_by("order")
    serializer_class = SocialLinkSerializer


class ContactCreateView(APIView):
    """Public contact form submission - matches old app/api/contact/route.ts."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyCertificateView(APIView):
    """Public certificate lookup - matches old app/api/verify/route.ts."""

    permission_classes = [AllowAny]

    def get(self, request):
        cert_id = request.query_params.get("id", "").strip()
        if not cert_id:
            return Response(
                {"error": "Certificate ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            certificate = Certificate.objects.get(certificate_id=cert_id.upper())
        except Certificate.DoesNotExist:
            return Response(
                {"error": "Certificate not found. Please check the ID and try again."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response({"certificate": CertificateSerializer(certificate).data})
