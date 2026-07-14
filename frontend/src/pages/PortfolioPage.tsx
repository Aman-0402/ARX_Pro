import PageHero from "@/components/PageHero";
import CTASection from "@/components/CTASection";
import { useApiData } from "@/hooks/useApiData";

interface PortfolioItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  client_name: string | null;
  live_url: string | null;
  featured: boolean;
}

export default function PortfolioPage() {
  const items = useApiData<PortfolioItem[]>("/api/content/portfolio/");

  return (
    <>
      <PageHero
        title="Our Portfolio"
        subtitle="Real projects. Real results. Explore what we've built for our clients."
      />

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {items.loading && <p className="text-center text-gray-500">Loading portfolio...</p>}
          {items.error && <p className="text-center text-red-500">{items.error}</p>}
          {items.data && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.data.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    {item.category}
                  </p>
                  <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-gray-500 mb-3">{item.description}</p>
                  {item.client_name && (
                    <p className="text-sm text-gray-400">Client: {item.client_name}</p>
                  )}
                  {item.live_url && (
                    <a
                      href={item.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold-400 text-sm font-semibold mt-2 inline-block"
                    >
                      View Live →
                    </a>
                  )}
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
