import { Globe, Lock, Zap } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";

const STRENGTHS = [
  {
    icon: Globe,
    title: "Global Service Capability",
    description:
      "Remote and on-site support models for businesses and academic institutions across India and globally.",
  },
  {
    icon: Lock,
    title: "Security-First Development",
    description:
      "Strong security practices baked into every solution - from code to infrastructure deployment.",
  },
  {
    icon: Zap,
    title: "Fast & Professional Delivery",
    description:
      "Structured project workflows with clear milestones ensuring quality delivery on time, every time.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About ARX Infotech"
        subtitle="A technology-driven organization delivering secure, scalable, and future-ready IT solutions."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-gold-400 font-semibold text-sm uppercase tracking-wider mb-3">
              Our Story
            </p>
            <h2 className="section-title mb-5">Who We Are</h2>
            <p className="section-subtitle">
              ARX Infotech is a technology-driven organization delivering end-to-end IT services,
              custom software, and modern digital solutions for businesses and institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STRENGTHS.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-8 shadow-sm">
                <item.icon className="text-gold-400 mb-4" size={32} />
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
