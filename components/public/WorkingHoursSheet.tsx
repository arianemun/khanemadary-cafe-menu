"use client";

import { useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatAdminTimeValue } from "@/lib/utils";
import { getTodayWeekdayKey } from "@/lib/working-hours";
import type { SiteSettings } from "@/lib/types";
import {
  PublicMenuDrawerSheet,
  PublicSheetHeader,
} from "@/components/public/PublicMenuDrawer";

interface WorkingHoursSheetProps {
  settings: SiteSettings;
  open: boolean;
  onClose: () => void;
}

export function WorkingHoursSheet({
  settings,
  open,
  onClose,
}: WorkingHoursSheetProps) {
  const t = useTranslations("workingHours");
  const locale = useLocale();
  const digitLocale = locale === "fa" ? "fa" : "en";
  const todayKey = getTodayWeekdayKey();

  const formatTime = useCallback(
    (time: string) => formatAdminTimeValue(time, digitLocale),
    [digitLocale]
  );

  return (
    <PublicMenuDrawerSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      aria-labelledby="working-hours-title"
    >
      <PublicSheetHeader>
        <h2
          id="working-hours-title"
          className="text-base font-bold text-foreground"
        >
          {t("title")}
        </h2>
        <p className="mt-2 text-xs text-secondary-text">
          {settings.workingHours.note ||
            t("defaultNote", { cafeName: settings.cafeName })}
        </p>
      </PublicSheetHeader>

      <ul className="divide-y divide-border px-4 py-2">
        {settings.workingHours.schedule.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <li
              key={day.key}
              className={`flex items-center justify-between gap-4 py-3 text-sm ${
                isToday ? "font-semibold" : ""
              }`}
            >
              <span className={isToday ? "text-accent" : undefined}>
                {t(`weekdays.${day.key}`)}
                {isToday ? (
                  <span className="ms-1.5 text-xs font-normal text-secondary-text">
                    ({t("today")})
                  </span>
                ) : null}
              </span>
              <span
                className={`shrink-0 tabular-nums ${
                  day.open ? "text-foreground" : "text-secondary-text"
                }`}
                dir="ltr"
              >
                {day.open ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span>{formatTime(day.end)}</span>
                    <ArrowLeft
                      className="h-3.5 w-3.5 shrink-0 opacity-70"
                      aria-hidden="true"
                    />
                    <span>{formatTime(day.start)}</span>
                  </span>
                ) : (
                  t("dayClosed")
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </PublicMenuDrawerSheet>
  );
}
