"use client";

import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import type { MenuItem } from "@/lib/types";
import { useTranslations } from "next-intl";

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onClick: () => void;
}

export function MenuItemCard({ item, index, onClick }: MenuItemCardProps) {
  const t = useTranslations("common");
  const price = item.discountedPrice ?? item.price;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid w-full min-h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 text-start",
        index % 2 === 0 ? "bg-muted" : "bg-card"
      )}
    >
      <div className="text-left">
        <div className="text-base font-bold">
          {formatPrice(price)}
        </div>
        <div className="text-xs text-secondary-text">{t("currency")}</div>
        {item.discountedPrice && (
          <div className="text-xs text-secondary-text line-through">
            {formatPrice(item.price)}
          </div>
        )}
      </div>
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card">
        {item.image && (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        )}
      </div>
      <div className="text-end">
        <div className="text-base font-bold leading-tight">{item.name}</div>
        <div className="text-xs text-secondary-text">{item.nameEn}</div>
        {!item.available && (
          <span className="mt-1 inline-block rounded bg-red-100 px-2 py-0.5 text-[10px] text-red-600">
            {t("outOfStock")}
          </span>
        )}
      </div>
    </button>
  );
}
