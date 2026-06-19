"use client";

import { locales, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const localeLabels: Record<string, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
  zh: "中文",
  ru: "Русский",
  tr: "Türkçe",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-btn border border-border bg-card px-3 py-2 text-sm"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4 text-accent" />
        <span>{localeLabels[locale]}</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 min-w-[140px] rounded-card border border-border bg-card p-1 shadow-card">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                router.replace(pathname, { locale: loc });
                setOpen(false);
              }}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-start text-sm hover:bg-muted",
                loc === locale && "bg-muted font-semibold"
              )}
            >
              {localeLabels[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
