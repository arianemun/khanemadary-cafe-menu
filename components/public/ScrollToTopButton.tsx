"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 400;

export function ScrollToTopButton() {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={cn(
        "fixed bottom-4 right-4 z-50 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-accent text-white shadow-card transition-all duration-300 ease-out",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t("scrollTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
