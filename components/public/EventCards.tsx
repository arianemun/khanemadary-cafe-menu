"use client";

import { FadeInImage } from "@/components/FadeInImage";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCards } from "swiper/modules";
import type { EventCard } from "@/lib/types";
import { eventOverlayGradient } from "@/lib/event-overlay";

import "swiper/css";
import "swiper/css/effect-cards";

interface EventCardsProps {
  events: EventCard[];
  variant?: "default" | "hero";
}

const FALLBACK_COLORS = [
  "#e86c3a",
  "#3f51b5",
  "#2e7d5a",
  "#8b5cf6",
  "#d97706",
];

function EventVideo({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
    />
  );
}

function formatEventDateRange(
  startDate: string | null,
  endDate: string | null,
  locale: string
): string | null {
  if (!startDate && !endDate) return null;
  const formatter = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    month: "short",
    day: "numeric",
  });
  const start = startDate ? formatter.format(new Date(startDate)) : null;
  const end = endDate ? formatter.format(new Date(endDate)) : null;
  if (start && end) return `${start} – ${end}`;
  return start ?? end;
}

export function EventCards({ events, variant = "default" }: EventCardsProps) {
  const locale = useLocale();
  const dir = locale === "fa" || locale === "ar" ? "rtl" : "ltr";
  const [activeIndex, setActiveIndex] = useState(0);
  const isHero = variant === "hero";

  if (!events.length) return null;

  const enableLoop = events.length >= 3;
  const enableAutoplay = events.length > 1;

  return (
    <section
      className={
        isHero
          ? "event-carousel-section relative flex w-full shrink-0 justify-center overflow-visible"
          : "event-carousel-section flex justify-center overflow-visible py-10"
      }
      aria-label={locale === "fa" ? "رویدادها" : "Events"}
    >
      <Swiper
        dir="ltr"
        modules={[Autoplay, EffectCards]}
        effect="cards"
        grabCursor
        loop={enableLoop}
        speed={480}
        cardsEffect={{
          slideShadows: false,
          rotate: true,
          perSlideOffset: 8,
          perSlideRotate: 2,
        }}
        autoplay={
          enableAutoplay
            ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        onSwiper={(swiper) => setActiveIndex(swiper.realIndex)}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className={`event-carousel event-carousel--cards ${isHero ? "event-carousel--hero" : "event-carousel--default"}`}
      >
        {events.map((event, index) => {
          const isActive = activeIndex === index;
          const fallbackColor = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          const dateRange = formatEventDateRange(
            event.startDate,
            event.endDate,
            locale
          );

          return (
            <SwiperSlide key={event.id} className="event-carousel-slide">
              <article
                dir={dir}
                className="event-carousel-card relative h-full w-full overflow-hidden rounded-card"
                style={
                  !event.image && !event.video
                    ? { backgroundColor: fallbackColor }
                    : undefined
                }
              >
                {event.video ? (
                  <EventVideo src={event.video} active={isActive} />
                ) : event.image ? (
                  <FadeInImage
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 480px) 280px, 300px"
                  />
                ) : null}

                <div
                  className="absolute inset-0"
                  style={{ background: eventOverlayGradient(event.overlayOpacity) }}
                  aria-hidden
                />

                <div className="relative z-10 flex h-full flex-col justify-between p-3 text-white">
                  {event.title ? (
                    <h3 className="self-end text-end text-sm font-bold leading-snug [text-shadow:0_2px_8px_rgba(0,0,0,0.55)] sm:text-base">
                      {event.title}
                    </h3>
                  ) : (
                    <span />
                  )}

                  {(event.description || dateRange) && (
                    <div className="self-start text-start">
                      {event.description ? (
                        <p className="line-clamp-2 text-xs leading-relaxed text-white/92 [text-shadow:0_1px_5px_rgba(0,0,0,0.55)] sm:line-clamp-3 sm:text-sm">
                          {event.description}
                        </p>
                      ) : null}
                      {dateRange ? (
                        <p className="mt-1.5 inline-flex rounded-full bg-white/18 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm [text-shadow:0_1px_4px_rgba(0,0,0,0.45)] sm:mt-2 sm:px-3 sm:py-1 sm:text-xs">
                          {dateRange}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
