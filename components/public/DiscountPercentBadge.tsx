import { Clock } from "lucide-react";
import { cn, formatAdminDigits } from "@/lib/utils";

type ProductBadgeVariant = "inline" | "overlay" | "modal";

const BADGE_SIZE: Record<ProductBadgeVariant, string> = {
  overlay: "h-[22px] w-[52px] py-0 px-0 text-[11px]",
  inline: "h-[18px] w-[46px] py-0 px-0 text-[10px]",
  modal: "min-h-[28px] w-auto px-3 py-0 text-xs gap-1",
};

function productBadgeShell(variant: ProductBadgeVariant, className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1 font-semibold leading-none backdrop-blur-sm rounded-full",
    BADGE_SIZE[variant],
    className
  );
}

function statusBadgeShell(variant: ProductBadgeVariant, className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-semibold leading-none backdrop-blur-sm rounded-full py-0",
    variant === "overlay"
      ? "min-h-[22px] px-3 text-[11px]"
      : variant === "modal"
        ? "min-h-[28px] px-3 text-xs"
        : "min-h-[18px] px-2.5 text-[10px]",
    className
  );
}

interface DiscountPercentBadgeProps {
  percent: number;
  digitLocale: "fa" | "en";
  className?: string;
  variant?: ProductBadgeVariant;
  suffixLabel?: string;
}

export function DiscountPercentBadge({
  percent,
  digitLocale,
  className,
  variant = "inline",
  suffixLabel,
}: DiscountPercentBadgeProps) {
  return (
    <span
      className={productBadgeShell(
        variant,
        cn(
          "border border-rose-300/30 bg-gradient-to-r from-rose-600 to-red-600 text-white",
          className
        )
      )}
    >
      {formatAdminDigits(String(percent), digitLocale)}٪
      {suffixLabel ? ` ${suffixLabel}` : null}
    </span>
  );
}

export function ItemStatusBadge({
  label,
  className,
  variant = "inline",
}: {
  label: string;
  className?: string;
  variant?: ProductBadgeVariant;
}) {
  return (
    <span
      className={statusBadgeShell(
        variant,
        cn(
          "border border-red-200/70 bg-red-50/95 text-red-700",
          className
        )
      )}
    >
      {label}
    </span>
  );
}

export function PreparationTimeBadge({
  minutes,
  digitLocale,
  className,
  variant = "inline",
  suffixLabel,
}: {
  minutes: number;
  digitLocale: "fa" | "en";
  className?: string;
  variant?: ProductBadgeVariant;
  suffixLabel?: string;
}) {
  return (
    <span
      className={productBadgeShell(
        variant,
        cn(
          "font-medium text-foreground/80",
          variant === "overlay"
            ? "border border-white/70 bg-white/88"
            : "border border-border/70 bg-muted",
          className
        )
      )}
    >
      <Clock
        className={cn(
          "shrink-0",
          variant === "overlay" ? "h-3 w-3" : variant === "modal" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
        )}
        strokeWidth={2.25}
        aria-hidden
      />
      {formatAdminDigits(String(minutes), digitLocale)}
      {suffixLabel ? ` ${suffixLabel}` : null}
    </span>
  );
}

interface ItemTitleRowProps {
  title: string;
  digitLocale: "fa" | "en";
  align?: "start" | "end";
  size?: "list" | "modal";
  statusLabel?: string | null;
  discountPercent?: number | null;
  durationMinutes?: number | null;
  minutesLabel?: string;
  discountLabel?: string;
}

export function ItemTitleRow({
  title,
  digitLocale,
  align = "end",
  size = "list",
  statusLabel,
  discountPercent,
  durationMinutes,
  minutesLabel,
  discountLabel,
}: ItemTitleRowProps) {
  const badgeVariant = size === "modal" ? "modal" : "inline";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 font-bold leading-tight",
        align === "end" ? "justify-end" : "justify-start",
        size === "modal" ? "text-base" : "text-[14px]"
      )}
    >
      <span>{title}</span>
      {durationMinutes != null && (
        <PreparationTimeBadge
          minutes={durationMinutes}
          digitLocale={digitLocale}
          variant={badgeVariant}
          suffixLabel={size === "modal" ? minutesLabel : undefined}
        />
      )}
      {discountPercent != null && (
        <DiscountPercentBadge
          percent={discountPercent}
          digitLocale={digitLocale}
          variant={badgeVariant}
          suffixLabel={size === "modal" ? discountLabel : undefined}
        />
      )}
      {statusLabel && (
        <ItemStatusBadge label={statusLabel} variant={badgeVariant} />
      )}
    </div>
  );
}
