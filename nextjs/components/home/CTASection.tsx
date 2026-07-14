"use client";

import Link from "next/link";
import { Send, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto">
        <div
          suppressHydrationWarning data-arx="fade-up"
          className="bg-navy-900 rounded-3xl px-8 py-16 text-center relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-400/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-gold-400 font-semibold font-poppins text-sm uppercase tracking-wider mb-4">
              Let&apos;s Work Together
            </p>
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Need IT Support or Custom Software?
            </h2>
            <p className="text-gray-300 text-lg mb-10 leading-relaxed">
              Get a free consultation and discover the best technology solution
              for your business.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold font-poppins rounded transition-colors duration-200"
              >
                <Send size={17} />
                Get Free Consultation
              </Link>
              <a
                href="tel:+918317818107"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/40 hover:border-gold-400 hover:text-gold-400 text-white font-bold font-poppins rounded transition-colors duration-200"
              >
                <Phone size={17} />
                +91 8317818107
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

