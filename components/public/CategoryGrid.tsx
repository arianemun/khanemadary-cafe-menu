"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
  onSelect: (id: string) => void;
}

export function CategoryGrid({ categories, onSelect }: CategoryGridProps) {
  const [main, topRight, bottomRight] = categories;

  if (!main) return null;

  return (
    <section className="bg-card px-4 py-section">
      <div className="mx-auto grid max-w-web grid-cols-2 gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(main.id)}
          className="relative col-span-1 row-span-2 min-h-[280px] overflow-hidden rounded-card"
        >
          {main.icon && (
            <Image src={main.icon} alt={main.name} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 right-4 text-right text-white">
            <p className="text-lg font-bold uppercase tracking-wide">{main.nameEn}</p>
            <p className="text-sm">{main.name}</p>
          </div>
        </motion.button>
        {[topRight, bottomRight].map((cat) =>
          cat ? (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(cat.id)}
              className="relative min-h-[136px] overflow-hidden rounded-card"
            >
              {cat.icon && (
                <Image src={cat.icon} alt={cat.name} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 right-3 text-right text-white">
                <p className="text-sm font-bold uppercase">{cat.nameEn}</p>
                <p className="text-xs">{cat.name}</p>
              </div>
            </motion.button>
          ) : null
        )}
      </div>
    </section>
  );
}
