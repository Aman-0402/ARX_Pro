"use client";

import { useState } from "react";
import { ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type PortfolioItem = {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string | null;
  tags: string | null;
  clientName: string | null;
  liveUrl: string | null;
  featured: boolean;
};

export default function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category))),
  ];
  const [active, setActive] = useState("All");

  const filtered =
    active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <>
      {/* Filter tabs */}
      <div
        className="flex flex-wrap justify-center gap-3 mb-12"
        suppressHydrationWarning data-arx="fade-up"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold font-poppins transition-colors duration-200",
              active === cat
                ? "bg-gold-400 text-navy-900"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gold-400 hover:text-gold-400"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
          >
            {/* Image / gradient header */}
            <div className="h-44 bg-gradient-to-br from-navy-900 to-navy-700 relative overflow-hidden">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute bottom-3 left-3">
                <span className="bg-gold-400 text-navy-900 text-xs font-bold font-poppins px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              {item.featured && (
                <div className="absolute top-3 right-3">
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-poppins font-bold text-navy-900 dark:text-white text-base mb-2 leading-snug">
                {item.title}
              </h3>
              {item.clientName && (
                <p className="text-gold-400 text-xs font-semibold mb-3">
                  {item.clientName}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed flex-1 mb-4">
                {item.description}
              </p>

              {/* Tags */}
              {item.tags && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded"
                    >
                      <Tag size={10} />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {item.liveUrl && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-gold-400 hover:text-gold-500 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Live Demo
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
