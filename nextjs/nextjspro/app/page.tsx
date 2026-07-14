import HeroSection from "@/components/home/HeroSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import ServicesSection from "@/components/home/ServicesSection";
import StatsCounter from "@/components/home/StatsCounter";
import WhatWeDeliverSection from "@/components/home/WhatWeDeliverSection";
import ClientsMarquee from "@/components/home/ClientsMarquee";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseSection />
      <ServicesSection />
      <StatsCounter />
      <WhatWeDeliverSection />
      <ClientsMarquee />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
