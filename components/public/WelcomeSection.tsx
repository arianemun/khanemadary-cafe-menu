"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SiteSettings } from "@/lib/types";

interface WelcomeSectionProps {
  settings: SiteSettings;
}

export function WelcomeSection({ settings }: WelcomeSectionProps) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {settings.heroVideoPoster && (
        <Image
          src={settings.heroVideoPoster}
          alt={settings.cafeName}
          fill
          priority
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 flex min-h-[70vh] flex-col items-end justify-end px-6 pb-24 pt-[var(--toolbar-height)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 text-white"
        >
          <Image
            src={settings.logo}
            alt={settings.cafeName}
            width={72}
            height={72}
            className="rounded-full"
          />
          <h1 className="text-2xl font-bold">{settings.cafeName}</h1>
          <p className="text-sm opacity-90">{settings.cafeNameEn}</p>
        </motion.div>
      </div>
    </section>
  );
}
