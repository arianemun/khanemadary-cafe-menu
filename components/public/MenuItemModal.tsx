"use client";

import { useEffect, useMemo, useState } from "react";
import { FadeInImage } from "@/components/FadeInImage";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useMenuStore } from "@/lib/store";
import { getItemImages, isLocalUploadImage } from "@/lib/item-images";
import { cn, formatAdminDigits } from "@/lib/utils";
import { ItemTitleRow } from "@/components/public/DiscountPercentBadge";
import { ItemPriceDisplay } from "@/components/public/ItemPriceDisplay";
import { getEffectiveDiscountPercent } from "@/lib/discount";
import { useTranslations, useLocale } from "next-intl";
import type { SiteSettings } from "@/lib/types";
import {
  PublicMenuDrawerSheet,
  PublicSheetHeader,
} from "@/components/public/PublicMenuDrawer";

interface MenuItemModalProps {
  settings: SiteSettings;
}

function GalleryNavButton({
  direction,
  onClick,
  label,
  isRtl,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  isRtl: boolean;
}) {
  const Icon =
    direction === "prev"
      ? isRtl
        ? ChevronRight
        : ChevronLeft
      : isRtl
        ? ChevronLeft
        : ChevronRight;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-foreground transition-colors hover:bg-muted/60"
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

const SWIPE_OFFSET_THRESHOLD = 36;
const SWIPE_VELOCITY_THRESHOLD = 250;

function resolveSwipeNavigation(
  offsetX: number,
  velocityX: number,
  isRtl: boolean,
  onPrev: () => void,
  onNext: () => void
) {
  if (Math.abs(offsetX) < SWIPE_OFFSET_THRESHOLD && Math.abs(velocityX) < SWIPE_VELOCITY_THRESHOLD) {
    return;
  }
  const swipeNext = isRtl ? offsetX > 0 : offsetX < 0;
  if (swipeNext) onNext();
  else onPrev();
}

function GalleryFrame({
  children,
  className,
  swipeEnabled,
  isRtl,
  onSwipePrev,
  onSwipeNext,
}: {
  children: React.ReactNode;
  className?: string;
  swipeEnabled: boolean;
  isRtl: boolean;
  onSwipePrev: () => void;
  onSwipeNext: () => void;
}) {
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!swipeEnabled) return;
    resolveSwipeNavigation(info.offset.x, info.velocity.x, isRtl, onSwipePrev, onSwipeNext);
  };

  return (
    <motion.div
      className={cn(
        "relative aspect-square overflow-hidden rounded-card border border-border bg-muted touch-pan-y",
        className
      )}
      drag={swipeEnabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

function MenuItemImageGallery({
  images,
  alt,
  unavailable,
}: {
  images: string[];
  alt: string;
  unavailable?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "fa" || locale === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const imagesKey = images.join("|");

  useEffect(() => {
    setActiveIndex(0);
    setSlideDirection(1);
  }, [imagesKey]);

  if (images.length === 0) {
    return (
      <div className="py-3">
        <div className="flex items-center">
          <div className="h-9 w-9 shrink-0" aria-hidden />
          <div
            className="aspect-square min-w-0 flex-1 rounded-card border border-border bg-muted"
            aria-hidden
          />
          <div className="h-9 w-9 shrink-0" aria-hidden />
        </div>
      </div>
    );
  }

  const currentSrc = images[activeIndex] ?? images[0]!;
  const imageAlt = activeIndex === 0 ? alt : `${alt} ${activeIndex + 1}`;
  const swipeEnabled = images.length > 1;

  const goPrev = () => {
    if (!swipeEnabled) return;
    setSlideDirection(-1);
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!swipeEnabled) return;
    setSlideDirection(1);
    setActiveIndex((index) => (index + 1) % images.length);
  };

  const galleryImage = (
    <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
      <motion.div
        key={`${imagesKey}-${activeIndex}`}
        custom={slideDirection}
        initial={{ opacity: 0, x: slideDirection * 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: slideDirection * -24 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <FadeInImage
          src={currentSrc}
          alt={imageAlt}
          fill
          className={cn("object-contain", unavailable && "grayscale")}
          sizes="(max-width: 960px) 100vw, 960px"
          unoptimized={isLocalUploadImage(currentSrc)}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );

  const gallerySideSlot = (direction: "prev" | "next") =>
    swipeEnabled ? (
      <GalleryNavButton
        direction={direction}
        label={direction === "prev" ? t("previousImage") : t("nextImage")}
        isRtl={isRtl}
        onClick={direction === "prev" ? goPrev : goNext}
      />
    ) : (
      <div className="h-9 w-9 shrink-0" aria-hidden />
    );

  return (
    <div className="py-3">
      <div className="flex items-center">
        {gallerySideSlot("prev")}
        <GalleryFrame
          className="min-w-0 flex-1"
          swipeEnabled={swipeEnabled}
          isRtl={isRtl}
          onSwipePrev={goPrev}
          onSwipeNext={goNext}
        >
          {galleryImage}
        </GalleryFrame>
        {gallerySideSlot("next")}
      </div>
    </div>
  );
}

export function MenuItemModal({ settings }: MenuItemModalProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const selectedItem = useMenuStore((s) => s.selectedItem);
  const setSelectedItem = useMenuStore((s) => s.setSelectedItem);
  const images = useMemo(
    () => (selectedItem ? getItemImages(selectedItem) : []),
    [selectedItem]
  );

  const close = () => setSelectedItem(null);

  const digitLocale = locale === "fa" || locale === "ar" ? "fa" : "en";
  const title = selectedItem
    ? formatAdminDigits(selectedItem.name, digitLocale)
    : "";
  const discountPercent =
    selectedItem?.available
      ? getEffectiveDiscountPercent(selectedItem.price, selectedItem.discountedPrice)
      : null;
  const statusLabel =
    selectedItem && !selectedItem.available ? t("outOfStock") : null;

  return (
    <PublicMenuDrawerSheet
      open={!!selectedItem}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      zIndexClass="z-[60]"
    >
      {selectedItem && (
        <>
          <PublicSheetHeader>
            <div className="flex items-center gap-2">
              <FadeInImage
                src={settings.logo}
                alt=""
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm font-semibold">{settings.cafeName}</span>
            </div>
          </PublicSheetHeader>
          <MenuItemImageGallery
            images={images}
            alt={selectedItem.name}
            unavailable={!selectedItem.available}
          />
          <div className="px-4 pb-6">
            <ItemTitleRow
              title={title}
              discountPercent={discountPercent}
              statusLabel={statusLabel}
              durationMinutes={selectedItem.preparationMinutes}
              minutesLabel={t("minutes")}
              discountLabel={t("discount")}
              digitLocale={digitLocale}
              align="start"
              size="modal"
            />
            {selectedItem.description ? (
              <p className="mt-2 text-[14px] text-foreground whitespace-pre-line">
                {selectedItem.description}
              </p>
            ) : null}
            {selectedItem.ingredients ? (
              <p className="mt-1 text-[14px] text-secondary-text whitespace-pre-line">
                {selectedItem.ingredients}
              </p>
            ) : null}
            <div className="mt-4">
              <ItemPriceDisplay
                item={selectedItem}
                digitLocale={digitLocale}
                align="start"
                size="modal"
              />
            </div>
          </div>
        </>
      )}
    </PublicMenuDrawerSheet>
  );
}
