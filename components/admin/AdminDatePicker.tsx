"use client";

import { useMemo } from "react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import { CalendarDays } from "lucide-react";
import { useAdminT } from "@/lib/admin-i18n";
import { cn, formatAdminDigits, adminFaDigitClass } from "@/lib/utils";
import "react-multi-date-picker/styles/colors/teal.css";

type AdminDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function toIsoDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fromIsoDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatGregorianInput(value: string, locale: "fa" | "en") {
  if (!value) return "";
  const date = fromIsoDate(value);
  if (!date) return value;
  const formatted = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return locale === "fa" ? formatAdminDigits(formatted, "fa") : formatted;
}

export function AdminDatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: AdminDatePickerProps) {
  const { locale } = useAdminT();
  const isoValue = toIsoDate(value);

  const pickerValue = useMemo(() => {
    const date = fromIsoDate(isoValue);
    if (!date) return undefined;
    return new DateObject({
      date,
      calendar: locale === "fa" ? persian : gregorian,
      locale: locale === "fa" ? persian_fa : gregorian_en,
    });
  }, [isoValue, locale]);

  if (locale === "fa") {
    return (
      <DatePicker
        value={pickerValue}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        disabled={disabled}
        onChange={(next) => {
          if (!next || Array.isArray(next)) {
            onChange("");
            return;
          }
          const picked = next as DateObject;
          const gregorianDate = picked.convert(gregorian, gregorian_en).toDate();
          if (!gregorianDate || Number.isNaN(gregorianDate.getTime())) {
            onChange("");
            return;
          }
          onChange(gregorianDate.toISOString().slice(0, 10));
        }}
        render={(displayValue, openCalendar) => (
          <button
            type="button"
            disabled={disabled}
            onClick={openCalendar}
            className={cn(
              "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              adminFaDigitClass("fa"),
              !displayValue && "text-[var(--admin-muted)]",
              className
            )}
          >
            <span dir="rtl" className={adminFaDigitClass("fa")}>
              {displayValue
                ? formatAdminDigits(String(displayValue), "fa")
                : placeholder ?? ""}
            </span>
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--admin-muted)]" />
          </button>
        )}
        containerClassName="w-full"
        calendarPosition="bottom-center"
        arrow={false}
        portal
        zIndex={2000}
      />
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type="date"
        disabled={disabled}
        value={isoValue}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !isoValue && "text-[var(--admin-muted)]"
        )}
        title={formatGregorianInput(isoValue, "en")}
      />
    </div>
  );
}
