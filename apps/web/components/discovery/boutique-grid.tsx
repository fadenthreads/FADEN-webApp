"use client";

import { motion } from "framer-motion";
import type { BoutiqueData } from "@/data/boutiques";
import { BoutiqueCard } from "./boutique-card";

export function BoutiqueGrid({ boutiques }: { boutiques: BoutiqueData[] }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {boutiques.map((boutique, i) => (
        <motion.div
          key={boutique.slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <BoutiqueCard boutique={boutique} className="w-full" />
        </motion.div>
      ))}
    </div>
  );
}
