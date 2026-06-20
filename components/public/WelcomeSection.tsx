"use client";

import { FadeInImage } from "@/components/FadeInImage";
import { motion } from "framer-motion";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { WorldCupMatchesHero } from "./WorldCupMatchesHero";
import { heroOverlayOpacityToRgba } from "@/lib/hero-overlay";
import type { SiteSettings } from "@/lib/types";

interface WelcomeSectionProps {
  settings: SiteSettings;
}

export function WelcomeSection({ settings }: WelcomeSectionProps) {
  const showVideo =
    settings.heroMediaType === "video" && Boolean(settings.heroVideoUrl);

  return (
    <section className="hero-viewport-height relative w-full">
      {showVideo ? (
        <video
          src={settings.heroVideoUrl!}
          poster={settings.heroVideoPoster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        settings.heroVideoPoster && (
          <FadeInImage
            src={settings.heroVideoPoster}
            alt={settings.cafeName}
            fill
            priority
            className="object-cover"
          />
        )
      )}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: heroOverlayOpacityToRgba(settings.heroOverlayOpacity) }}
      />
      <div className="absolute inset-0 z-10 mx-auto flex w-full max-w-web flex-col px-4 pb-20 pt-4">
        <div className="flex w-full flex-1 flex-col items-stretch justify-center">
          <WorldCupMatchesHero config={settings.worldCup} />
        </div>
        <div className="mt-auto flex flex-col items-stretch gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start gap-1 text-start text-white"
          >
            <FadeInImage
              src={settings.logo}
              alt={settings.cafeName}
              width={80}
              height={80}
              className="h-20 w-20 shrink-0 rounded-full shadow-lg"
            />
            <h1 className="text-2xl font-bold [text-shadow:0_2px_8px_rgba(0,0,0,0.65)]">
              {settings.cafeName}
            </h1>
            <p className="text-sm opacity-90 [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]">
              {settings.cafeNameEn}
            </p>
          </motion.div>
          {settings.announcements.length > 0 ? (
            <AnnouncementBanner
              announcements={settings.announcements}
              variant="hero"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
