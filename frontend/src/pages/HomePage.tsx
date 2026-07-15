import { Link } from "react-router-dom";
import { Cog, ShieldCheck, Cloud, Zap } from "lucide-react";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface Stat {
  id: number;
  target: number;
  suffix: string;
  label: string;
}

interface Testimonial {
  id: number;
  name: string;
  company: string;
  text: string;
  stars: number;
}

const WHY_CHOOSE = [
  { icon: ShieldCheck, title: "Security-First", text: "Every solution is built with security baked in from day one." },
  { icon: Cloud, title: "Cloud-Ready", text: "Scalable, modern infrastructure ready for growth." },
  { icon: Zap, title: "Fast Delivery", text: "Structured workflows with clear milestones and on-time delivery." },
];

export default function HomePage() {
  const services = useApiData<Service[]>("/api/content/services/");
  const stats = useApiData<Stat[]>("/api/content/stats/");
  const testimonials = useApiData<Testimonial[]>("/api/content/testimonials/");

  return (
    <>
      <section className="relative min-h-[80vh] flex items-center bg-navy-900 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/20" />
        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-gold-400 rounded-full" />
              Trusted IT Partner
            </div>
            <h1 className="font-bold text-4xl md:text-6xl text-white leading-tight mb-6">
              IT Services & <span className="text-gold-400">Modern Tech Solutions</span> for
              Businesses
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
              ARX Infotech delivers scalable IT services, software development, cloud migration,
              and academic automation solutions to help organizations grow faster.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="btn-primary">
                <Cog size={18} />
                Explore Services
              </Link>
              <Link to="/contact" className="btn-outline">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Why Choose Us
            </p>
            <h2 className="section-title">Built for Reliability</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {WHY_CHOOSE.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 shadow-sm text-center">
                <item.icon className="text-gold-400 mx-auto mb-4" size={36} />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Services
            </p>
            <h2 className="section-title">What We Offer</h2>
          </div>
          {services.loading && <p className="text-center text-gray-500">Loading services...</p>}
          {services.error && <p className="text-center text-red-500">{services.error}</p>}
          {services.data && (
            <div className="grid md:grid-cols-3 gap-8">
              {services.data.map((service) => (
                <div key={service.id} className="bg-gray-50 rounded-xl p-8 shadow-sm">
                  <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                  <p className="text-gray-500">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-navy-900">
        <div className="container mx-auto px-4">
          {stats.loading && (
            <p className="text-center text-gray-400">Loading stats...</p>
          )}
          {stats.error && <p className="text-center text-red-400">{stats.error}</p>}
          {stats.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.data.map((stat) => (
                <div key={stat.id}>
                  <div className="text-4xl font-bold text-gold-400 mb-2">
                    {stat.target}
                    {stat.suffix}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          {testimonials.loading && (
            <p className="text-center text-gray-500">Loading testimonials...</p>
          )}
          {testimonials.error && (
            <p className="text-center text-red-500">{testimonials.error}</p>
          )}
          {testimonials.data && (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.data.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-xl p-8 shadow-sm">
                  <p className="text-gray-600 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.company}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
