"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { isCafeOpen } from "@/lib/working-hours";
import type { SiteSettings } from "@/lib/types";
import { WorkingHoursSheet } from "./WorkingHoursSheet";

interface WorkingHoursBarProps {
  settings: SiteSettings;
}

function StatusDot({ open, color }: { open: boolean; color: string }) {
  if (!open) {
    return (
      <span
        className="flex h-2.5 w-2.5 shrink-0 rounded-full bg-secondary-text"
        aria-hidden
      />
    );
  }

  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

export function WorkingHoursBar({ settings }: WorkingHoursBarProps) {
  const t = useTranslations("workingHours");
  const locale = useLocale();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(settings.isOpen);

  useEffect(() => {
    const update = () => {
      setIsOpen(
        isCafeOpen(settings.workingHours.config, settings.forceClosed)
      );
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [settings.forceClosed, settings.workingHours.config]);

  const title = isOpen
    ? settings.workingHours.openMessage || t("open")
    : settings.workingHours.closedMessage || t("closed");
  const subtitle =
    settings.workingHours.note ||
    t("defaultNote", { cafeName: settings.cafeName });

  const open = useCallback(() => setSheetOpen(true), []);
  const close = useCallback(() => setSheetOpen(false), []);
  const isRtl = locale === "fa" || locale === "ar";

  const textBlock = (
    <div className="min-w-0 text-start">
      <p className="text-sm font-bold leading-snug text-foreground">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-xs leading-snug text-secondary-text">
          {subtitle}
        </p>
      ) : null}
    </div>
  );

  const statusDot = (
    <StatusDot open={isOpen} color={settings.workingHours.openColor} />
  );

  return (
    <>
      <div className="py-10">
        <button
          type="button"
          onClick={open}
          className="mx-auto flex h-[60px] w-full max-w-web items-center gap-3 px-4 transition-colors hover:bg-muted/40 active:bg-muted/60"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
        >
          <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
            {isRtl ? (
              <>
                {statusDot}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {statusDot}
              </>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1 self-center text-xs text-secondary-text">
            {isRtl ? (
              <>
                <span>{t("viewHours")}</span>
                <span className="text-lg leading-none" aria-hidden>
                  ←
                </span>
              </>
            ) : (
              <>
                <span>{t("viewHours")}</span>
                <span className="text-lg leading-none" aria-hidden>
                  →
                </span>
              </>
            )}
          </span>
        </button>
      </div>
      <WorkingHoursSheet
        settings={settings}
        open={sheetOpen}
        onClose={close}
      />
    </>
  );
}
