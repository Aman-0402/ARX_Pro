import type { ComponentType } from "react";
import {
  Globe, Smartphone, Briefcase, Cloud, TrendingUp, GraduationCap, Code, Shield, Database,
  Settings, Server, Laptop2, Wrench,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const ICON_MAP: Record<string, ComponentType<{ size?: number; className?: string }>> = {
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
  server: Server,
  laptop: Laptop2,
};

export default function ServicesPage() {
  const services = useApiData<Service[]>("/api/content/services/");

  return (
    <>
      <PageHero
        title="Our Services"
        subtitle="Managed IT services, cloud migration, custom software development, cybersecurity, and more."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {services.loading && <p className="text-center text-gray-500">Loading services...</p>}
          {services.error && <p className="text-center text-red-500">{services.error}</p>}
          {services.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.data.map((service) => {
                const Icon = ICON_MAP[service.icon] ?? Wrench;
                return (
                  <div key={service.id} className="bg-white rounded-xl p-8 shadow-sm">
                    <Icon className="text-gold-400 mb-4" size={32} />
                    <h3 className="font-bold text-xl mb-2">{service.title}</h3>
                    <p className="text-gray-500">{service.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
