"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMenuStore } from "@/lib/store";
import type { Category, SiteSettings } from "@/lib/types";

interface NavigationDrawerProps {
  categories: Category[];
  settings: SiteSettings;
  onSelect: (id: string) => void;
}

export function NavigationDrawer({
  categories,
  settings,
  onSelect,
}: NavigationDrawerProps) {
  const open = useMenuStore((s) => s.navOpen);
  const setNavOpen = useMenuStore((s) => s.setNavOpen);

  const items = [
    ...categories,
    { id: "contacts", name: "راه‌های ارتباطی", nameEn: "Contacts" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] bg-black/40"
          onClick={() => setNavOpen(false)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-4 shadow-card backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setNavOpen(false)}>
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
            <h2 className="mb-4 text-center text-lg font-bold">{settings.cafeName}</h2>
            <div className="space-y-2">
              {items.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelect(cat.id);
                    setNavOpen(false);
                  }}
                  className="w-full rounded-card border border-border bg-card px-4 py-4 text-center shadow-sm"
                >
                  <div className="font-bold">{cat.name}</div>
                  <div className="text-xs text-secondary-text">{cat.nameEn}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
