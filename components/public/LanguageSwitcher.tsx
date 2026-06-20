"use client";

import { LanguageFlag } from "@/components/admin/LanguageFlag";
import { locales, usePathname, useRouter } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const localeLabels: Record<string, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
  zh: "中文",
  ru: "Русский",
  tr: "Türkçe",
};

interface LanguageSwitcherProps {
  enabledLanguages?: Locale[];
}

export function LanguageSwitcher({ enabledLanguages }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleScroll = () => setOpen(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const availableLocales = enabledLanguages
    ? locales.filter((loc) => enabledLanguages.includes(loc))
    : locales;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-accent text-white shadow-card"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("language")}
      >
        <Globe className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 min-w-[140px] rounded-card border border-border bg-card p-1 shadow-card">
          {availableLocales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                router.replace(pathname, { locale: loc });
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-btn px-3 py-2 text-start text-sm hover:bg-muted",
                loc === locale && "bg-muted font-semibold"
              )}
            >
              <LanguageFlag code={loc} />
              {localeLabels[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
