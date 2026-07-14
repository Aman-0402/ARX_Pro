import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import CTASection from "@/components/home/CTASection";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore ARX Infotech's portfolio of successful web, mobile, cloud, and enterprise software projects.",
};

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      description: true,
      image: true,
      tags: true,
      clientName: true,
      liveUrl: true,
      featured: true,
    },
  });

  return (
    <>
      <PageHero
        title="Our Portfolio"
        subtitle="Real projects. Real results. Explore what we've built for our clients."
      />

      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
            <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
              What We&apos;ve Built
            </p>
            <h2 className="section-title mb-4">Case Studies &amp; Projects</h2>
          </div>
          <PortfolioGrid items={items} />
        </div>
      </section>

      <CTASection />
    </>
  );
}

