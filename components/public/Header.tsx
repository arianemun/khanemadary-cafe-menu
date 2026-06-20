"use client";

import { useEffect, useState } from "react";
import { FadeInImage } from "@/components/FadeInImage";
import { Menu, Share2 } from "lucide-react";
import { useMenuStore } from "@/lib/store";
import type { HeaderBackgroundMode, SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  settings: SiteSettings;
}

const GLASS_CLASSES = "bg-card/55 backdrop-blur-xl backdrop-saturate-150";
const WHITE_CLASSES = "bg-card";
const SCROLL_THRESHOLD = 50;

function useHeaderScrolled(enabled: boolean) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onScroll = () => {
      setScrolled(window.scrollY >= SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return scrolled;
}

function useScrollProgress(enabled: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;

    const update = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        maxScroll > 0
          ? Math.min(100, (window.scrollY / maxScroll) * 100)
          : 0;
      setProgress(pct);
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return progress;
}

function getHeaderBackgroundClasses(
  mode: HeaderBackgroundMode,
  scrolled: boolean
): string {
  switch (mode) {
    case "glass":
      return GLASS_CLASSES;
    case "white":
      return WHITE_CLASSES;
    case "white-to-glass":
      return cn(
        "transition-[background-color,backdrop-filter] duration-300",
        scrolled ? GLASS_CLASSES : WHITE_CLASSES
      );
  }
}

export function Header({ settings }: HeaderProps) {
  const setNavOpen = useMenuStore((s) => s.setNavOpen);
  const setShareOpen = useMenuStore((s) => s.setShareOpen);
  const mode = settings.headerBackground;
  const scrolled = useHeaderScrolled(mode === "white-to-glass");
  const scrollProgressEnabled = settings.scrollProgressEnabled;
  const progress = useScrollProgress(scrollProgressEnabled);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border/60 toolbar-height",
        getHeaderBackgroundClasses(mode, scrolled)
      )}
    >
      <div
        className="mx-auto flex h-full max-w-web items-center gap-x-2 px-4"
        dir="ltr"
      >
        <div className="flex shrink-0 items-center justify-start">
          {settings.shareEnabled && (
            <button
              type="button"
              aria-label="share"
              onClick={() => setShareOpen(true)}
              className="flex min-h-11 min-w-11 items-center justify-center text-accent"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>
        {scrollProgressEnabled ? (
          <div className="flex min-w-0 flex-1 items-center px-1" aria-hidden>
            <div className="h-px w-full overflow-hidden rounded-full bg-border/50">
              <div
                className="h-full w-full bg-accent"
                style={{
                  transform: `scaleX(${progress / 100})`,
                  transformOrigin: "left",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-1">
          <FadeInImage
            src={settings.logo}
            alt={settings.cafeName}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover"
          />
          <button
            type="button"
            aria-label="menu"
            onClick={() => setNavOpen(true)}
            className="flex h-11 w-11 items-center justify-center text-accent"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
