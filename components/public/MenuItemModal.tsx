"use client";

import Image from "next/image";
import { X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMenuStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { SiteSettings } from "@/lib/types";

interface MenuItemModalProps {
  settings: SiteSettings;
}

export function MenuItemModal({ settings }: MenuItemModalProps) {
  const t = useTranslations("common");
  const selectedItem = useMenuStore((s) => s.selectedItem);
  const setSelectedItem = useMenuStore((s) => s.setSelectedItem);

  if (!selectedItem) return null;

  const price = selectedItem.discountedPrice ?? selectedItem.price;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={() => setSelectedItem(null)}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="absolute inset-x-0 bottom-0 max-h-[100dvh] overflow-y-auto rounded-t-2xl bg-card shadow-card sm:max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <button type="button" onClick={() => setSelectedItem(null)} aria-label="close" className="flex min-h-11 min-w-11 items-center justify-center">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Image src={settings.logo} alt="" width={28} height={28} className="rounded-full" />
              <span className="text-sm font-semibold">{settings.cafeName}</span>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full bg-muted">
            {selectedItem.image && (
              <Image
                src={selectedItem.image}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <Send className="h-5 w-5 text-accent" />
            <div className="flex gap-3 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="px-4 pb-4">
            <h2 className="text-xl font-bold">{selectedItem.name}</h2>
            <p className="mt-1 text-sm text-secondary-text whitespace-pre-line">
              {selectedItem.ingredients}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold">
                {formatPrice(price)} {t("currency")}
              </span>
            </div>
          </div>
          <div className="sticky bottom-0 border-t border-border bg-card p-4">
            <Button className="w-full" size="lg">
              {t("add")}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
