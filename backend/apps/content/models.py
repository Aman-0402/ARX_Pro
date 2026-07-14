from django.db import models


class Contact(models.Model):
    name = models.CharField(max_length=150)
    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, null=True, blank=True)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "contacts"

    def __str__(self):
        return f"{self.name} - {self.subject}"


class Certificate(models.Model):
    certificate_id = models.CharField(max_length=100, unique=True, db_column="certificate_id")
    holder_name = models.CharField(max_length=150, db_column="holder_name")
    course_name = models.CharField(max_length=255, db_column="course_name")
    issue_date = models.DateField(db_column="issue_date")
    expiry_date = models.DateField(null=True, blank=True, db_column="expiry_date")
    is_valid = models.BooleanField(default=True, db_column="is_valid")
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "certificates"

    def __str__(self):
        return self.certificate_id


class BlogPost(models.Model):
    slug = models.SlugField(max_length=255, unique=True)
    title = models.CharField(max_length=500)
    excerpt = models.TextField()
    content = models.TextField()
    cover_image = models.CharField(max_length=500, null=True, blank=True, db_column="cover_image")
    category = models.CharField(max_length=100)
    tags = models.CharField(max_length=500, null=True, blank=True)
    author = models.CharField(max_length=150)
    published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True, db_column="published_at")
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")
    updated_at = models.DateTimeField(auto_now=True, db_column="updated_at")

    class Meta:
        db_table = "blog_posts"

    def __str__(self):
        return self.title


class TeamMember(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    bio = models.TextField(null=True, blank=True)
    photo = models.CharField(max_length=500, null=True, blank=True)
    linkedin = models.CharField(max_length=500, null=True, blank=True)
    twitter = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "team_members"

    def __str__(self):
        return self.name


class PortfolioItem(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    category = models.CharField(max_length=100)
    description = models.TextField()
    content = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=500, null=True, blank=True)
    tags = models.CharField(max_length=500, null=True, blank=True)
    client_name = models.CharField(max_length=255, null=True, blank=True, db_column="client_name")
    live_url = models.CharField(max_length=500, null=True, blank=True, db_column="live_url")
    featured = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "portfolio_items"

    def __str__(self):
        return self.title


class Stat(models.Model):
    icon = models.CharField(max_length=100, default="users")
    target = models.IntegerField()
    suffix = models.CharField(max_length=20)
    label = models.CharField(max_length=150)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "stats"

    def __str__(self):
        return self.label


class Client(models.Model):
    name = models.CharField(max_length=255)
    logo = models.CharField(max_length=500, null=True, blank=True)
    website = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "clients"

    def __str__(self):
        return self.name


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=150, null=True, blank=True)
    text = models.TextField()
    stars = models.FloatField(default=5)
    avatar = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "testimonials"

    def __str__(self):
        return f"{self.name} ({self.company})"


class Service(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, default="briefcase")
    image = models.CharField(max_length=500, null=True, blank=True)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "services"

    def __str__(self):
        return self.title


class PricingPlan(models.Model):
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=255)
    price = models.CharField(max_length=50)
    period = models.CharField(max_length=50)
    badge = models.CharField(max_length=100, null=True, blank=True)
    badge_variant = models.CharField(max_length=20, default="gold", db_column="badge_variant")
    highlight = models.BooleanField(default=False)
    features = models.TextField()
    button_label = models.CharField(max_length=100, default="Get Quote", db_column="button_label")
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "pricing_plans"

    def __str__(self):
        return self.name


class SiteContact(models.Model):
    address = models.TextField()
    phone = models.CharField(max_length=50)
    email = models.CharField(max_length=150)
    whatsapp = models.CharField(max_length=50, null=True, blank=True)
    map_embed = models.TextField(null=True, blank=True, db_column="map_embed")
    updated_at = models.DateTimeField(auto_now=True, db_column="updated_at")

    class Meta:
        db_table = "site_contact"

    def __str__(self):
        return self.email


class SocialLink(models.Model):
    platform = models.CharField(max_length=50)
    label = models.CharField(max_length=100)
    url = models.CharField(max_length=500)
    order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="created_at")

    class Meta:
        db_table = "social_links"

    def __str__(self):
        return f"{self.platform}: {self.label}"
