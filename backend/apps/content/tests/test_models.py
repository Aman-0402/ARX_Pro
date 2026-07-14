from django.test import TestCase

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


class ContentModelsTest(TestCase):
    def test_contact_create_and_str_fields(self):
        contact = Contact.objects.create(
            name="Jane Doe",
            email="jane@example.com",
            subject="Question",
            message="Hello there",
        )
        self.assertEqual(Contact.objects.count(), 1)
        self.assertIsNone(contact.phone)

    def test_certificate_unique_certificate_id(self):
        Certificate.objects.create(
            certificate_id="CERT-001",
            holder_name="John Smith",
            course_name="Cloud Fundamentals",
            issue_date="2026-01-01",
        )
        self.assertTrue(
            Certificate.objects.filter(certificate_id="CERT-001", is_valid=True).exists()
        )

    def test_blog_post_defaults(self):
        post = BlogPost.objects.create(
            slug="hello-world",
            title="Hello World",
            excerpt="Intro",
            content="Full content",
            category="News",
            author="ARX Team",
        )
        self.assertFalse(post.published)
        self.assertIsNone(post.published_at)

    def test_team_member_ordering_defaults(self):
        member = TeamMember.objects.create(name="Alice", role="Engineer")
        self.assertEqual(member.order, 0)
        self.assertTrue(member.active)

    def test_portfolio_item_unique_slug(self):
        PortfolioItem.objects.create(
            title="Project X",
            slug="project-x",
            category="Web",
            description="A project",
        )
        self.assertEqual(PortfolioItem.objects.count(), 1)

    def test_stat_defaults(self):
        stat = Stat.objects.create(target=100, suffix="+", label="Clients")
        self.assertEqual(stat.icon, "users")
        self.assertTrue(stat.active)

    def test_client_defaults(self):
        client = Client.objects.create(name="Acme Corp")
        self.assertEqual(client.order, 0)
        self.assertTrue(client.active)

    def test_testimonial_default_stars(self):
        testimonial = Testimonial.objects.create(
            name="Bob", company="Acme", text="Great service"
        )
        self.assertEqual(testimonial.stars, 5)

    def test_service_defaults(self):
        service = Service.objects.create(title="Cloud Migration", description="We migrate")
        self.assertEqual(service.icon, "briefcase")

    def test_pricing_plan_defaults(self):
        plan = PricingPlan.objects.create(
            name="Starter",
            tagline="For small teams",
            price="$99",
            period="month",
            features="Feature A\nFeature B",
        )
        self.assertEqual(plan.badge_variant, "gold")
        self.assertEqual(plan.button_label, "Get Quote")
        self.assertFalse(plan.highlight)

    def test_site_contact_singleton_style_create(self):
        contact = SiteContact.objects.create(
            address="123 Street", phone="+1 555 0100", email="info@arxinfo.tech"
        )
        self.assertIsNone(contact.whatsapp)

    def test_social_link_defaults(self):
        link = SocialLink.objects.create(
            platform="linkedin", label="LinkedIn", url="https://linkedin.com/company/arx"
        )
        self.assertEqual(link.order, 0)
        self.assertTrue(link.active)
