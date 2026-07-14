import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Smartphone,
  Briefcase,
  Cloud,
  TrendingUp,
  GraduationCap,
  Code,
  Shield,
  Database,
  Settings,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/db";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  globe: Globe,
  smartphone: Smartphone,
  briefcase: Briefcase,
  cloud: Cloud,
  trending: TrendingUp,
  graduation: GraduationCap,
  code: Code,
  shield: Shield,
  database: Database,
  settings: Settings,
};

export default async function ServicesSection() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take: 3,
  });

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
          <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
            What We Do
          </p>
          <h2 className="section-title mb-4">Our Core Services</h2>
          <p className="section-subtitle">
            Complete IT and digital transformation solutions for businesses of all sizes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {services.map((s, i) => {
            const Icon = ICON_MAP[s.icon] ?? Briefcase;
            return (
              <div
                key={s.id}
                suppressHydrationWarning data-arx="fade-up"
                data-arx-delay={i * 50}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-transparent hover:border-gold-400/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 bg-navy-900 overflow-hidden">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-900" />
                  )}
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
                  {/* Icon badge */}
                  <div className="absolute bottom-4 left-5 w-12 h-12 bg-gold-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Icon size={22} className="text-navy-900" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-poppins font-bold text-lg text-navy-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center" suppressHydrationWarning data-arx="fade-up">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-navy-900 hover:bg-navy-800 dark:bg-gold-400 dark:hover:bg-gold-500 dark:text-navy-900 text-white font-bold font-poppins rounded transition-colors duration-200"
          >
            View All Services <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

