"use client";

import { FadeInImage } from "@/components/FadeInImage";
import { cn, formatAdminDigits } from "@/lib/utils";
import {
  DiscountPercentBadge,
  ItemTitleRow,
  PreparationTimeBadge,
} from "@/components/public/DiscountPercentBadge";
import { getEffectiveDiscountPercent } from "@/lib/discount";
import type { MenuItem } from "@/lib/types";
import type { ResolvedItemLayout } from "@/lib/category-item-display";
import { ItemPriceDisplay } from "@/components/public/ItemPriceDisplay";
import { useLocale } from "next-intl";

interface MenuItemCardProps {
  item: MenuItem;
  layout: ResolvedItemLayout;
  oddBackground: boolean;
  onClick: () => void;
}

function PriceBlock({
  item,
  align,
  digitLocale,
}: {
  item: MenuItem;
  align: "start" | "end";
  digitLocale: "fa" | "en";
}) {
  return <ItemPriceDisplay item={item} align={align} digitLocale={digitLocale} size="card" />;
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
}: {
  item: MenuItem;
  displayName: string;
  discountPercent: number | null;
  digitLocale: "fa" | "en";
}) {
  return (
    <>
      <PriceBlock item={item} align="start" digitLocale={digitLocale} />
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
        {item.ingredients ? (
          <div className="text-[12px] text-secondary-text whitespace-pre-line">
            {item.ingredients}
          </div>
        ) : null}
      </div>
    </>
  );
}

function LineLayout({
  item,
  displayName,
  discountPercent,
  digitLocale,
  imageSide,
}: {
  item: MenuItem;
  displayName: string;
  discountPercent: number | null;
  digitLocale: "fa" | "en";
  imageSide: "start" | "end";
}) {
  const priceAlign = imageSide === "end" ? "start" : "end";
  const textAlign = imageSide === "end" ? "text-end" : "text-start";
  const titleAlign = imageSide === "end" ? "end" : "start";

  const textBlock = (
    <div className={cn("flex min-w-0 flex-1 flex-col justify-center py-0.5", textAlign)}>
      <ItemTitleRow title={displayName} digitLocale={digitLocale} align={titleAlign} />
      <div className="my-1 h-px w-full bg-border" aria-hidden />
      {item.ingredients ? (
        <div className="text-[12px] text-secondary-text whitespace-pre-line">
          {item.ingredients}
        </div>
      ) : null}
    </div>
  );

  const priceBlock = (
    <PriceBlock item={item} align={priceAlign} digitLocale={digitLocale} />
  );

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
        />
      ) : (
        <LineLayout
          item={item}
          displayName={displayName}
          discountPercent={discountPercent}
          digitLocale={digitLocale}
          imageSide={layout === "line-right" ? "end" : "start"}
        />
      )}
    </button>
  );
}
