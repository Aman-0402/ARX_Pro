"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: string };
type FaqSection = { category: string; items: FaqItem[] };

export default function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.category}>
          <h3 className="font-poppins font-bold text-lg text-navy-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
            {section.category}
          </h3>
          <div className="space-y-3">
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`;
              const isOpen = open === key;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-semibold text-navy-900 dark:text-white text-sm pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        "shrink-0 text-gold-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
