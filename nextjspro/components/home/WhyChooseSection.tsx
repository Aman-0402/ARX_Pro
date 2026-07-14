"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const reasons = [
  "Global service capability with remote & on-site support models.",
  "Client-first approach with transparent communication and dedicated assistance.",
  "Strong focus on quality, scalability, and security in solution design.",
  "Professional delivery aligned with long-term business sustainability.",
];

const highlights = [
  { value: "24/7", label: "Support" },
  { value: "100%", label: "Client Focus" },
  { value: "Secure", label: "Solutions" },
  { value: "Fast", label: "Delivery" },
];

export default function WhyChooseSection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div suppressHydrationWarning data-arx="fade-right">
            <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-3">
              Why ARX Infotech
            </p>
            <h2 className="section-title mb-4">Why Choose ARX Infotech?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg leading-relaxed">
              We focus on delivering secure, scalable, and high-performance
              solutions with a client-first approach.
            </p>

            <ul className="space-y-4 mb-8">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-gold-400 shrink-0 mt-0.5"
                  />
                  <span className="text-gray-600 dark:text-gray-300">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/about" className="btn-primary">
              Learn More <ArrowRight size={16} />
            </Link>
          </div>

          {/* Right — navy highlight box */}
          <div suppressHydrationWarning data-arx="fade-left" data-arx-delay="100">
            <div className="bg-navy-900 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="font-poppins font-bold text-2xl mb-3">
                We Build Future-Ready Systems
              </h3>
              <p className="text-gray-300 leading-relaxed mb-8">
                Cloud migration, automation, IT services, software products, and
                digital platforms — designed for growth.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {highlights.map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-white/10 rounded-xl p-5 text-center"
                  >
                    <div className="font-poppins font-bold text-3xl text-white mb-1">
                      {value}
                    </div>
                    <div className="text-gold-400 font-semibold text-sm">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

