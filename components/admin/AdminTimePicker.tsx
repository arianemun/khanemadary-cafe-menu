"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useAdminT } from "@/lib/admin-i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatAdminTimeValue, normalizeAdminTimeValue, adminFaDigitClass } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function parseTime(value: string) {
  const normalized = normalizeAdminTimeValue(value || "00:00");
  const [hourPart, minutePart] = normalized.split(":");
  const hour = Math.min(23, Math.max(0, Number.parseInt(hourPart ?? "0", 10) || 0));
  const minute = Math.min(59, Math.max(0, Number.parseInt(minutePart ?? "0", 10) || 0));
  return { hour, minute };
}

function toTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatPickerUnit(value: number, locale: "fa" | "en") {
  const text = String(value).padStart(2, "0");
  return locale === "fa" ? formatAdminTimeValue(text, "fa") : text;
}

type AdminTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

function TimeColumn({
  values,
  selected,
  locale,
  onSelect,
}: {
  values: number[];
  selected: number;
  locale: "fa" | "en";
  onSelect: (value: number) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div
      ref={listRef}
      className="h-48 w-14 overflow-y-auto rounded-md border border-[var(--admin-border)] scrollbar-hide"
    >
      {values.map((unit) => (
        <button
          key={unit}
          ref={unit === selected ? selectedRef : undefined}
          type="button"
          onClick={() => onSelect(unit)}
          className={cn(
            "flex h-9 w-full items-center justify-center text-sm transition-colors hover:bg-gray-100",
            adminFaDigitClass(locale),
            unit === selected &&
              "bg-[var(--admin-accent)]/10 font-medium text-[var(--admin-accent)]"
          )}
        >
          {formatPickerUnit(unit, locale)}
        </button>
      ))}
    </div>
  );
}

export function AdminTimePicker({
  value,
  onChange,
  className,
  disabled,
}: AdminTimePickerProps) {
  const { locale, dir } = useAdminT();
  const parsed = parseTime(value);
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);

  useEffect(() => {
    const next = parseTime(value);
    setHour(next.hour);
    setMinute(next.minute);
  }, [value]);

  function commit(nextHour: number, nextMinute: number) {
    onChange(toTimeValue(nextHour, nextMinute));
  }

  function handleHourSelect(nextHour: number) {
    setHour(nextHour);
    commit(nextHour, minute);
  }

  function handleMinuteSelect(nextMinute: number) {
    setMinute(nextMinute);
    commit(hour, nextMinute);
  }

  const displayValue = formatAdminTimeValue(toTimeValue(hour, minute), locale);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-32 items-center justify-between gap-2 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-sm text-[var(--admin-text)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            adminFaDigitClass(locale),
            className
          )}
        >
          <span dir="ltr" className={adminFaDigitClass(locale)}>
            {displayValue}
          </span>
          <Clock className="h-4 w-4 shrink-0 text-[var(--admin-muted)]" />
        </button>
      </PopoverTrigger>
      <PopoverContent dir={dir} align="start" className="w-auto p-3">
        <div className="flex items-start gap-2">
          <TimeColumn
            values={HOURS}
            selected={hour}
            locale={locale}
            onSelect={handleHourSelect}
          />
          <span className="pt-3 text-sm font-medium text-[var(--admin-muted)]">:</span>
          <TimeColumn
            values={MINUTES}
            selected={minute}
            locale={locale}
            onSelect={handleMinuteSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
