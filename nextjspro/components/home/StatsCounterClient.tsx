"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import {
  Users, FolderOpen, Calendar, Headphones,
  Trophy, Star, Award, Globe, Building2, Heart, Shield, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  users: Users, folder: FolderOpen, calendar: Calendar, headphones: Headphones,
  trophy: Trophy, star: Star, award: Award, globe: Globe,
  building: Building2, heart: Heart, shield: Shield, zap: Zap,
};

type Stat = { id: number; icon: string; target: number; suffix: string; label: string };

function Counter({ target, suffix, delay }: { target: number; suffix: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 2,
      delay,
      ease: "easeOut",
      onUpdate(value) {
        if (ref.current) ref.current.textContent = Math.round(value) + suffix;
      },
    });
    return () => controls.stop();
  }, [isInView, target, suffix, delay]);

  return <span ref={ref} className="font-poppins font-bold text-4xl md:text-5xl text-white">0{suffix}</span>;
}

export default function StatsCounterClient({ stats }: { stats: Stat[] }) {
  return (
    <section className="py-20 bg-navy-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => {
            const Icon = ICON_MAP[s.icon] ?? Users;
            return (
              <div key={s.id} className="text-center" suppressHydrationWarning data-arx="fade-up">
                <div className="w-14 h-14 bg-gold-400/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-gold-400" />
                </div>
                <Counter target={s.target} suffix={s.suffix} delay={i * 0.2} />
                <p className="text-gray-300 font-poppins mt-2 text-sm">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

