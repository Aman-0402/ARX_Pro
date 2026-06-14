import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Cloud, Handshake, Globe, Lock, Zap, ArrowRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "About",
  description:
    "ARX Infotech is a technology-driven organization delivering end-to-end IT services, custom software, and modern digital solutions for businesses and institutions.",
};

const highlights = [
  { icon: ShieldCheck, label: "Security-focused IT Solutions" },
  { icon: Cloud, label: "Cloud-ready scalable systems" },
  { icon: Handshake, label: "Client-first transparent support" },
];

const strengths = [
  {
    icon: Globe,
    title: "Global Service Capability",
    description:
      "Remote and on-site support models for businesses and academic institutions across India and globally.",
    delay: 0,
  },
  {
    icon: Lock,
    title: "Security-First Development",
    description:
      "Strong security practices baked into every solution — from code to infrastructure deployment.",
    delay: 100,
  },
  {
    icon: Zap,
    title: "Fast & Professional Delivery",
    description:
      "Structured project workflows with clear milestones ensuring quality delivery on time, every time.",
    delay: 200,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About ARX Infotech"
        subtitle="A technology-driven organization delivering secure, scalable, and future-ready IT solutions."
      />

      {/* Who We Are */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div suppressHydrationWarning data-arx="fade-right">
              <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
                Our Story
              </p>
              <h2 className="section-title mb-5">Who We Are</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                ARX Infotech is a technology-driven organization focused on
                delivering end-to-end IT services, custom software development,
                and modern digital solutions for businesses and academic
                institutions.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                Our mission is to simplify operations, enhance performance, and
                accelerate growth through scalable and secure technology
                implementations.
              </p>

              <div className="space-y-4 mb-8">
                {highlights.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gold-400/10 rounded-lg flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-gold-400" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary">
                Work With Us <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right — Vision + Mission */}
            <div suppressHydrationWarning data-arx="fade-left" data-arx-delay="100">
              <div className="bg-navy-900 rounded-2xl p-8 text-white shadow-2xl">
                <div className="mb-8">
                  <h3 className="font-poppins font-bold text-2xl mb-3 text-gold-400">
                    Our Vision
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    To become a trusted global technology partner for
                    organizations by delivering innovative IT services and
                    digital transformation solutions that enable long-term
                    success.
                  </p>
                </div>
                <div className="border-t border-white/10 pt-8">
                  <h3 className="font-poppins font-bold text-2xl mb-3 text-gold-400">
                    Our Mission
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    To provide modern IT solutions, automation platforms, and
                    custom software systems that improve productivity, reduce
                    operational costs, and support business growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Strength */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
            <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
              Why We Stand Out
            </p>
            <h2 className="section-title mb-4">Our Core Strength</h2>
            <p className="section-subtitle">
              What makes ARX Infotech different from others.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {strengths.map(({ icon: Icon, title, description, delay }) => (
              <div
                key={title}
                suppressHydrationWarning data-arx="fade-up"
                data-arx-delay={delay}
                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-7 border border-gray-100 dark:border-gray-700 text-center group hover:border-gold-400/40 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-gold-400/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-gold-400 transition-colors duration-300">
                  <Icon
                    size={24}
                    className="text-gold-400 group-hover:text-navy-900 transition-colors duration-300"
                  />
                </div>
                <h3 className="font-poppins font-bold text-lg text-navy-900 dark:text-white mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

