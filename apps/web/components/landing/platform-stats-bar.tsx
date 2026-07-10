"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Scissors, Star, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const FALLBACK_STATS = [
  { key: "boutiques", value: "500+", label: "Trusted Boutiques", icon: Building2 },
  { key: "customers", value: "10K+", label: "Happy Customers", icon: Users },
  { key: "outfits", value: "25K+", label: "Outfits Customized", icon: Scissors },
  { key: "cities", value: "15+", label: "Cities Covered", icon: MapPin },
  { key: "rating", value: "4.8/5", label: "Average Rating", icon: Star },
] as const;

type ApiStats = {
  boutiques?: string;
  customers?: string;
  averageRating?: string;
  hasAverageRating?: boolean;
};

export function PlatformStatsBar() {
  const reducedMotion = useReducedMotion();
  const [live, setLive] = useState<ApiStats | null>(null);

  useEffect(() => {
    fetch("/api/platform/stats")
      .then((res) => res.json())
      .then((data: { stats?: ApiStats; source?: string }) => {
        if (data.source === "live" && data.stats) setLive(data.stats);
      })
      .catch(() => undefined);
  }, []);

  const stats = FALLBACK_STATS.map((item) => {
    if (item.key === "boutiques" && live?.boutiques && live.boutiques !== "0") {
      return { ...item, value: live.boutiques };
    }
    if (item.key === "customers" && live?.customers && live.customers !== "0") {
      return { ...item, value: live.customers };
    }
    if (item.key === "rating" && live?.hasAverageRating && live.averageRating) {
      return { ...item, value: `${live.averageRating}/5` };
    }
    return item;
  });

  return (
    <section aria-label="Platform statistics" className="border-y border-navy/8 bg-[#f7f4ef]">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-x-4 gap-y-5 px-4 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:px-12 lg:py-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.key}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              className="flex flex-col items-center text-center"
            >
              <Icon className="mb-2 h-5 w-5 text-gold" strokeWidth={1.5} aria-hidden />
              <p className="font-display text-2xl font-bold text-navy md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[11px] font-medium tracking-wide text-foreground-muted md:text-xs">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
