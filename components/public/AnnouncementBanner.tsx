"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale } from "next-intl";
import {
  canShowAnnouncement,
  incrementAnnouncementView,
} from "@/lib/announcement-views";
import { cn } from "@/lib/utils";
import type { AnnouncementCard } from "@/lib/types";

/** Reserved slot height so hero layout does not shift when banner appears/dismisses. */
export const ANNOUNCEMENT_SLOT_MIN_HEIGHT = "min-h-[72px]";

interface AnnouncementBannerProps {
  announcements: AnnouncementCard[];
  variant?: "default" | "hero";
}

interface CloseButtonProps {
  durationSeconds: number;
  onDismiss: () => void;
  ariaLabel: string;
  announcementKey: string;
  variant: "default" | "hero";
}

function CloseButton({
  durationSeconds,
  onDismiss,
  ariaLabel,
  announcementKey,
  variant,
}: CloseButtonProps) {
  const reduceMotion = useReducedMotion();
  const progressRef = useRef<SVGCircleElement>(null);
  const size = 28;
  const stroke = 1.5;
  const center = size / 2;
  const radius = center - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const dashArray = `${circumference} ${circumference}`;
  const showRing = durationSeconds > 0;

  useEffect(() => {
    const circle = progressRef.current;
    if (!circle || !showRing) return;

    circle.style.strokeDasharray = dashArray;

    if (reduceMotion) {
      circle.style.transition = "none";
      circle.style.strokeDashoffset = "0";
      return;
    }

    const durationMs = durationSeconds * 1000;
    const startTime = performance.now();
    let rafId = 0;

    const applyOffset = (offset: number) => {
      circle.style.strokeDashoffset = `${offset}`;
    };

    applyOffset(0);

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      applyOffset(circumference * progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    announcementKey,
    circumference,
    dashArray,
    durationSeconds,
    reduceMotion,
    showRing,
  ]);

  return (
    <button
      type="button"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full transition-colors",
        variant === "hero"
          ? "text-white/75 hover:bg-white/10 hover:text-white"
          : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
      )}
      style={{ width: size, height: size }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDismiss();
      }}
      aria-label={ariaLabel}
    >
      {showRing ? (
        <svg
          key={announcementKey}
          className="pointer-events-none absolute inset-0 -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className={
              variant === "hero" ? "text-white/35" : "text-foreground/15"
            }
          />
          <circle
            ref={progressRef}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ strokeDasharray: dashArray, strokeDashoffset: 0 }}
          />
        </svg>
      ) : null}
      <X className="relative z-10 h-3.5 w-3.5" strokeWidth={2} />
    </button>
  );
}

interface BannerBodyProps {
  announcement: AnnouncementCard;
  variant: "default" | "hero";
  onDismiss: () => void;
  dismissLabel: string;
}

function BannerBody({
  announcement,
  variant,
  onDismiss,
  dismissLabel,
}: BannerBodyProps) {
  const isHero = variant === "hero";

  const content = (
    <div className="min-w-0 flex-1 space-y-0.5">
      {announcement.title ? (
        <p
          className={cn(
            "truncate text-sm font-semibold leading-tight",
            isHero ? "text-white" : "text-foreground"
          )}
        >
          {announcement.title}
        </p>
      ) : null}
      {announcement.message ? (
        <p
          className={cn(
            "line-clamp-2 text-xs leading-snug",
            isHero ? "text-white/75" : "text-foreground/60"
          )}
        >
          {announcement.message}
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 backdrop-blur-xl",
        isHero
          ? "border-white/25 bg-white/15"
          : "border-white/20 bg-white/80 shadow-sm"
      )}
    >
      {announcement.link ? (
        <a
          href={announcement.link}
          className={cn(
            "flex min-w-0 flex-1 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-1",
            isHero
              ? "focus-visible:ring-white/30"
              : "focus-visible:ring-foreground/20"
          )}
        >
          {content}
        </a>
      ) : (
        content
      )}
      <CloseButton
        durationSeconds={announcement.durationSeconds}
        onDismiss={onDismiss}
        ariaLabel={dismissLabel}
        announcementKey={announcement.id}
        variant={variant}
      />
    </div>
  );
}

export function AnnouncementBanner({
  announcements,
  variant = "default",
}: AnnouncementBannerProps) {
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [sessionQueue, setSessionQueue] = useState<AnnouncementCard[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [hidden, setHidden] = useState(false);

  // Snapshot eligible announcements once per visit so dismissing one does not
  // shrink the queue mid-session (which would skip remaining announcements).
  useEffect(() => {
    const queue = announcements.filter(
      (item) =>
        item.active &&
        (item.title || item.message) &&
        canShowAnnouncement(item.id, item.maxDisplayCount)
    );
    setSessionQueue(queue);
    setQueueIndex(0);
    setHidden(false);
  }, [announcements]);

  const current = sessionQueue[queueIndex] ?? null;
  const isShowing = !hidden && current !== null;
  const dismissLabel = locale === "fa" ? "بستن" : "Dismiss";

  const dismissCurrent = useCallback(() => {
    if (!current) return;
    incrementAnnouncementView(current.id);
    if (queueIndex < sessionQueue.length - 1) {
      setQueueIndex((index) => index + 1);
      return;
    }
    setHidden(true);
  }, [current, sessionQueue.length, queueIndex]);

  useEffect(() => {
    if (!current || current.durationSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      dismissCurrent();
    }, current.durationSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [current, dismissCurrent]);

  const motionProps = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div
      className={cn(ANNOUNCEMENT_SLOT_MIN_HEIGHT, "mx-auto flex w-full max-w-web items-center")}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {isShowing && current ? (
          <motion.div
            key={current.id}
            className="w-full"
            {...motionProps}
          >
            <BannerBody
              announcement={current}
              variant={variant}
              onDismiss={dismissCurrent}
              dismissLabel={dismissLabel}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
