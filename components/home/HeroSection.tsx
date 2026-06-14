"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cog, Send, ShieldCheck, Cloud, TrendingUp } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-navy-900 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        suppressHydrationWarning
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/50 to-navy-900/10" />

      {/* Content */}
      <div className="relative z-10 container mx-auto pt-24 pb-16">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/30 text-gold-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
            Trusted IT Partner
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
          >
            IT Services &{" "}
            <span className="text-gold-400">Modern Tech Solutions</span>{" "}
            for Businesses
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl"
          >
            ARX Infotech delivers scalable IT services, software development,
            cloud migration, and academic automation solutions to help
            organizations grow faster.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <div className="relative group">
              <Link
                href="/services"
                className="relative inline-block p-px font-semibold leading-6 text-white bg-navy-800 shadow-2xl cursor-pointer rounded-xl shadow-navy-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative z-10 block px-6 py-3 rounded-xl bg-navy-900">
                  <div className="relative z-10 flex items-center space-x-2">
                    <Cog size={18} />
                    <span className="transition-all duration-500 group-hover:translate-x-1">Explore Services</span>
                    <svg className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" fillRule="evenodd" />
                    </svg>
                  </div>
                </span>
              </Link>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/60 hover:border-gold-400 hover:text-gold-400 text-white font-bold font-poppins rounded transition-colors duration-200 text-base"
            >
              <Send size={18} />
              Get Free Consultation
            </Link>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { icon: ShieldCheck, label: "Secure Solutions" },
              { icon: Cloud, label: "Cloud Ready" },
              { icon: TrendingUp, label: "Business Growth" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm px-4 py-2 rounded-full"
              >
                <Icon size={15} className="text-gold-400" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
    </section>
  );
}

