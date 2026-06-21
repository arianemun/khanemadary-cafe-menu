"use client";

import { cn, formatAdminDigits, formatPrice } from "@/lib/utils";
import { TomanIcon } from "@/components/TomanIcon";
import type { MenuItem } from "@/lib/types";

type ItemPriceFields = Pick<
  MenuItem,
  | "price"
  | "discountedPrice"
  | "secondaryPriceEnabled"
  | "secondaryPrice"
  | "secondaryDiscountedPrice"
  | "primaryPriceLabel"
  | "secondaryPriceLabel"
>;

function PriceAmount({
  price,
  iconSize,
  className,
}: {
  price: number;
  iconSize: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {formatPrice(price)}
      <TomanIcon size={iconSize} className="text-secondary-text" />
    </span>
  );
}

function ModalPriceLine({
  label,
  price,
  digitLocale,
}: {
  label?: string;
  price: number;
  digitLocale: "fa" | "en";
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      {label ? (
        <span className="shrink-0 text-sm font-medium text-foreground">
          {formatAdminDigits(label, digitLocale)}
        </span>
      ) : (
        <span className="shrink-0" aria-hidden />
      )}
      <PriceAmount price={price} iconSize={14} className="font-bold text-base" />
    </div>
  );
}

export function ItemPriceDisplay({
  item,
  digitLocale,
  align = "start",
  size = "card",
}: {
  item: ItemPriceFields;
  digitLocale: "fa" | "en";
  align?: "start" | "end";
  size?: "card" | "modal";
}) {
  const hasSecondary =
    item.secondaryPriceEnabled && item.secondaryPrice != null;

  const primary = item.discountedPrice ?? item.price;
  const secondary = hasSecondary
    ? item.secondaryDiscountedPrice ?? item.secondaryPrice!
    : null;

  if (!hasSecondary || secondary == null) {
    return (
      <div className={cn("shrink-0", align === "end" ? "text-end" : "text-start")}>
        <PriceAmount
          price={primary}
          iconSize={size === "modal" ? 14 : 12}
          className={cn("font-bold", size === "modal" ? "text-base" : "text-[14px]")}
        />
      </div>
    );
  }

  if (size === "modal") {
    return (
      <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
        <ModalPriceLine
          label={item.primaryPriceLabel}
          price={primary}
          digitLocale={digitLocale}
        />
        <ModalPriceLine
          label={item.secondaryPriceLabel}
          price={secondary}
          digitLocale={digitLocale}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[14px] font-bold",
        align === "end" ? "justify-end" : "justify-start"
      )}
    >
      <PriceAmount price={primary} iconSize={12} />
      <span className="text-secondary-text" aria-hidden>
        /
      </span>
      <PriceAmount price={secondary} iconSize={12} />
    </div>
  );
}
