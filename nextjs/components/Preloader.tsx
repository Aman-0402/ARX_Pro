"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-navy-900 flex flex-col items-center justify-center"
        >
          {/* Outer glow ring */}
          <div className="relative flex items-center justify-center">
            <motion.span
              className="absolute w-28 h-28 rounded-full border-2 border-gold-400/20"
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute w-20 h-20 rounded-full border border-gold-400/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Spinning arc */}
            <svg
              className="absolute w-24 h-24 animate-spin [animation-duration:1.4s]"
              viewBox="0 0 96 96"
              fill="none"
            >
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="url(#arcGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="138 138"
                strokeDashoffset="69"
              />
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FACC15" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FACC15" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-14 h-14 relative"
            >
              <Image
                src="/images/logo.png"
                alt="ARX Infotech"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[3px] bg-gold-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
