"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollTabToHorizontalCenter } from "@/lib/scroll-nav";
import type { Category, HeaderBackgroundMode } from "@/lib/types";

interface CategoryTabsProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
  showContacts?: boolean;
  backgroundMode?: HeaderBackgroundMode;
}

const SCROLL_AMOUNT = 220;
const SCROLL_THRESHOLD = 50;
const USER_TAB_SCROLL_LOCK_MS = 1500;
const GLASS_CLASSES = "bg-card/55 backdrop-blur-xl backdrop-saturate-150";
const WHITE_CLASSES = "bg-card";

function useCategoryTabsScrolled(enabled: boolean) {
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

function getCategoryTabsBackgroundClasses(
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

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
  showContacts = true,
  backgroundMode = "glass",
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const userTabScrollRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const userTabScrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const scrolled = useCategoryTabsScrolled(backgroundMode === "white-to-glass");

  const tabs = showContacts
    ? [
        ...categories,
        {
          id: "contacts",
          name: "راه‌های ارتباطی",
          nameEn: "Contacts",
          slug: "contacts",
          icon: null,
          sortOrder: 99,
        },
      ]
    : categories;

  const scrollTabs = useCallback((direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;

    const isRtl = getComputedStyle(el).direction === "rtl";
    const delta =
      direction === "next"
        ? isRtl
          ? -SCROLL_AMOUNT
          : SCROLL_AMOUNT
        : isRtl
          ? SCROLL_AMOUNT
          : -SCROLL_AMOUNT;

    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTabScroll = () => {
      if (programmaticScrollRef.current) return;

      userTabScrollRef.current = true;
      if (userTabScrollTimerRef.current) clearTimeout(userTabScrollTimerRef.current);
      userTabScrollTimerRef.current = setTimeout(() => {
        userTabScrollRef.current = false;
      }, USER_TAB_SCROLL_LOCK_MS);
    };

    el.addEventListener("scroll", onTabScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onTabScroll);
      if (userTabScrollTimerRef.current) clearTimeout(userTabScrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeId || userTabScrollRef.current) return;

    const tab = tabRefs.current[activeId];
    const container = scrollRef.current;
    if (!tab || !container) return;

    programmaticScrollRef.current = true;
    scrollTabToHorizontalCenter(container, tab);

    const timer = setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 500);

    return () => {
      clearTimeout(timer);
      programmaticScrollRef.current = false;
    };
  }, [activeId]);

  const handleSelect = useCallback(
    (id: string) => {
      userTabScrollRef.current = false;
      if (userTabScrollTimerRef.current) clearTimeout(userTabScrollTimerRef.current);
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <nav
      aria-label="Menu categories"
      className={cn(
        "sticky-below-toolbar w-full self-start border-b border-border category-tabs-height",
        getCategoryTabsBackgroundClasses(backgroundMode, scrolled)
      )}
    >
      <div className="flex h-full w-full items-center">
        <button
          type="button"
          onClick={() => scrollTabs("prev")}
          className="flex h-full shrink-0 items-center px-2 text-secondary-text/20 transition-colors hover:text-secondary-text/40"
          aria-label="Previous categories"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <div
          ref={scrollRef}
          className="flex h-full min-w-0 flex-1 items-center gap-6 overflow-x-auto px-1 scrollbar-hide"
        >
          {tabs.map((cat) => (
            <button
              key={cat.id}
              ref={(el) => {
                tabRefs.current[cat.id] = el;
              }}
              type="button"
              onClick={() => handleSelect(cat.id)}
              className={cn(
                "flex h-full shrink-0 flex-col items-start justify-center gap-1 whitespace-nowrap border-b-2 px-3 text-right leading-none transition-[color,border-color]",
                activeId === cat.id
                  ? "border-accent"
                  : "border-transparent hover:text-foreground/80"
              )}
            >
              <span className="text-sm font-bold leading-tight">{cat.name}</span>
              {cat.nameEn ? (
                <span
                  dir="ltr"
                  className="text-xs font-extralight leading-tight text-secondary-text"
                >
                  {cat.nameEn}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs("next")}
          className="flex h-full shrink-0 items-center px-2 text-secondary-text/20 transition-colors hover:text-secondary-text/40"
          aria-label="Next categories"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
