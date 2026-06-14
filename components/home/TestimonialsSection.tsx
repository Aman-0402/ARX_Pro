import { Star, Quote } from "lucide-react";
import { prisma } from "@/lib/db";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={15}
          className={
            i <= Math.floor(rating)
              ? "fill-gold-400 text-gold-400"
              : i - 0.5 === rating
              ? "fill-gold-400/50 text-gold-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          }
        />
      ))}
    </div>
  );
}

export default async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-14" suppressHydrationWarning data-arx="fade-up">
          <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
            Client Reviews
          </p>
          <h2 className="section-title mb-4">What Our Clients Say</h2>
          <p className="section-subtitle">
            Trusted by clients across India for reliable IT solutions and services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              suppressHydrationWarning data-arx="fade-up"
              data-arx-delay={i * 100}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg hover:border-gold-400/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 text-gold-400/20">
                <Quote size={40} />
              </div>

              <StarRating rating={t.stars} />

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1 text-sm">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center shrink-0">
                    <span className="font-poppins font-bold text-xs text-gold-400">
                      {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-poppins font-bold text-navy-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-gold-400 text-xs font-semibold">
                    {t.role ? `${t.role}, ` : ""}{t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

