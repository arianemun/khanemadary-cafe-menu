"use client";

import { FadeInImage } from "@/components/FadeInImage";
import { cn, formatPrice, formatAdminDigits } from "@/lib/utils";
import { TomanIcon } from "@/components/TomanIcon";
import {
  DiscountPercentBadge,
  ItemTitleRow,
  PreparationTimeBadge,
} from "@/components/public/DiscountPercentBadge";
import { getEffectiveDiscountPercent } from "@/lib/discount";
import type { MenuItem } from "@/lib/types";
import type { ResolvedItemLayout } from "@/lib/category-item-display";
import { useLocale } from "next-intl";

interface MenuItemCardProps {
  item: MenuItem;
  layout: ResolvedItemLayout;
  oddBackground: boolean;
  onClick: () => void;
}

function PriceBlock({
  price,
  align,
}: {
  price: number;
  align: "start" | "end";
}) {
  return (
    <div className={cn("shrink-0", align === "end" ? "text-end" : "text-start")}>
      <div
        className={cn(
          "flex items-center gap-0.5 text-[14px] font-bold",
          align === "end" && "justify-end"
        )}
      >
        {formatPrice(price)}
        <TomanIcon size={12} className="text-secondary-text" />
      </div>
    </div>
  );
}

function ProductImageBlock({
  src,
  alt,
  unavailable,
  discountPercent,
  preparationMinutes,
  digitLocale,
}: {
  src: string | null;
  alt: string;
  unavailable?: boolean;
  discountPercent: number | null;
  preparationMinutes: number | null | undefined;
  digitLocale: "fa" | "en";
}) {
  const showBadges =
    preparationMinutes != null || discountPercent != null;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <div className="relative h-full w-full overflow-hidden rounded-card">
        {src && (
          <FadeInImage
            src={src}
            alt={alt}
            fill
            className={cn("object-cover", unavailable && "grayscale")}
          />
        )}
      </div>
      {showBadges && (
        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-center gap-1.5 px-1">
          {preparationMinutes != null && (
            <PreparationTimeBadge
              minutes={preparationMinutes}
              digitLocale={digitLocale}
              variant="overlay"
            />
          )}
          {discountPercent != null && (
            <DiscountPercentBadge
              percent={discountPercent}
              digitLocale={digitLocale}
              variant="overlay"
            />
          )}
        </div>
      )}
    </div>
  );
}

function CenterLayout({
  item,
  displayName,
  discountPercent,
  digitLocale,
  price,
}: {
  item: MenuItem;
  displayName: string;
  discountPercent: number | null;
  digitLocale: "fa" | "en";
  price: number;
}) {
  return (
    <>
      <PriceBlock price={price} align="start" />
      <ProductImageBlock
        src={item.image}
        alt={displayName}
        unavailable={!item.available}
        discountPercent={discountPercent}
        preparationMinutes={item.preparationMinutes}
        digitLocale={digitLocale}
      />
      <div className="text-end">
        <ItemTitleRow title={displayName} digitLocale={digitLocale} align="end" />
        <div className="text-[12px] text-secondary-text">{item.nameEn}</div>
      </div>
    </>
  );
}

function LineLayout({
  item,
  displayName,
  discountPercent,
  digitLocale,
  price,
  imageSide,
}: {
  item: MenuItem;
  displayName: string;
  discountPercent: number | null;
  digitLocale: "fa" | "en";
  price: number;
  imageSide: "start" | "end";
}) {
  const priceAlign = imageSide === "end" ? "start" : "end";
  const textAlign = imageSide === "end" ? "text-end" : "text-start";
  const titleAlign = imageSide === "end" ? "end" : "start";

  const textBlock = (
    <div className={cn("flex min-w-0 flex-1 flex-col justify-center py-0.5", textAlign)}>
      <ItemTitleRow title={displayName} digitLocale={digitLocale} align={titleAlign} />
      <div className="my-1 h-px w-full bg-border" aria-hidden />
      <div className="text-[12px] text-secondary-text">{item.nameEn}</div>
    </div>
  );

  const priceBlock = <PriceBlock price={price} align={priceAlign} />;

  const imageBlock = (
    <ProductImageBlock
      src={item.image}
      alt={displayName}
      unavailable={!item.available}
      discountPercent={discountPercent}
      preparationMinutes={item.preparationMinutes}
      digitLocale={digitLocale}
    />
  );

  return imageSide === "end" ? (
    <>
      {priceBlock}
      {textBlock}
      {imageBlock}
    </>
  ) : (
    <>
      {imageBlock}
      {textBlock}
      {priceBlock}
    </>
  );
}

export function MenuItemCard({
  item,
  layout,
  oddBackground,
  onClick,
}: MenuItemCardProps) {
  const locale = useLocale();
  const price = item.discountedPrice ?? item.price;
  const digitLocale = locale === "fa" || locale === "ar" ? "fa" : "en";
  const displayName = formatAdminDigits(item.name, digitLocale);
  const discountPercent = item.available
    ? getEffectiveDiscountPercent(item.price, item.discountedPrice)
    : null;

  const isCenter = layout === "center";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full min-h-[150px] items-center gap-4 px-4 py-4 text-start",
        isCenter && "grid grid-cols-[1fr_auto_1fr]",
        oddBackground ? "bg-muted" : "bg-card"
      )}
    >
      {isCenter ? (
        <CenterLayout
          item={item}
          displayName={displayName}
          discountPercent={discountPercent}
          digitLocale={digitLocale}
          price={price}
        />
      ) : (
        <LineLayout
          item={item}
          displayName={displayName}
          discountPercent={discountPercent}
          digitLocale={digitLocale}
          price={price}
          imageSide={layout === "line-right" ? "end" : "start"}
        />
      )}
    </button>
  );
}
