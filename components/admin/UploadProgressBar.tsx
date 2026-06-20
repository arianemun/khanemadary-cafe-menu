"use client";

import { cn, adminFaDigitClass, formatAdminDisplayValue } from "@/lib/utils";
import { useAdminT } from "@/lib/admin-i18n";

type UploadProgressBarProps = {
  progress: number | null;
  fileName?: string | null;
  label?: string;
  className?: string;
};

export function UploadProgressBar({
  progress,
  fileName,
  label,
  className,
}: UploadProgressBarProps) {
  const { locale } = useAdminT();
  if (progress == null) return null;

  const displayLabel = fileName ?? label;

  return (
    <div className={cn("space-y-1.5", className)} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--admin-muted)]">
        {displayLabel ? <span className="truncate">{displayLabel}</span> : <span />}
        <span className={adminFaDigitClass(locale, "shrink-0 text-inherit tabular-nums")}>
          {formatAdminDisplayValue(Math.round(progress), locale)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-border)]">
        <div
          className="h-full rounded-full bg-[var(--admin-primary)] transition-[width] duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
