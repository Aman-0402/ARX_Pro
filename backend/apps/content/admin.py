from django.contrib import admin

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

admin.site.register(Contact)
admin.site.register(Certificate)
admin.site.register(BlogPost)
admin.site.register(TeamMember)
admin.site.register(PortfolioItem)
admin.site.register(Stat)
admin.site.register(Client)
admin.site.register(Testimonial)
admin.site.register(Service)
admin.site.register(PricingPlan)
admin.site.register(SiteContact)
admin.site.register(SocialLink)
