"use client";

import { MapProviderIcon } from "@/components/MapProviderIcon";
import { useTranslations } from "next-intl";
import {
  MAP_PROVIDER_KEYS,
  buildMapHref,
  normalizeMapsSettings,
  type MapsSettings,
} from "@/lib/maps-settings";

interface MapLinksProps {
  coordinates: [number, number];
  maps: MapsSettings;
}

export function MapLinks({ coordinates, maps }: MapLinksProps) {
  const t = useTranslations("maps");
  const config = normalizeMapsSettings(maps);

  const links = MAP_PROVIDER_KEYS.filter((key) => config.enabled.includes(key)).map(
    (key) => ({
      key,
      href: buildMapHref(key, coordinates, config.urls[key]),
    })
  );

  if (!links.length) return null;

  const count = links.length;
  const gridClass =
    count === 1
      ? "grid grid-cols-1 gap-2"
      : count === 2
        ? "grid grid-cols-2 gap-2"
        : count === 3
          ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
          : "grid grid-cols-2 gap-2 min-[768px]:grid-cols-4";

  return (
    <div className="space-y-2">
      <h3 className="text-center text-sm font-semibold">{t("sectionTitle")}</h3>
      <div className={gridClass}>
        {links.map((link, index) => {
          const label = t("navigateIn", { platform: t(link.key) });

          return (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              title={label}
              className={[
                "flex h-10 min-w-0 w-full items-center justify-center gap-1.5 overflow-hidden rounded-btn border border-border bg-card px-2 text-xs font-medium hover:bg-muted min-[768px]:px-3",
                count === 3 && index === 2
                  ? "col-span-2 w-[calc(50%-0.25rem)] justify-self-center sm:col-span-1 sm:w-full sm:justify-self-stretch"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <MapProviderIcon
                provider={link.key}
                size={18}
                className="size-[18px] shrink-0"
              />
              <span className="truncate whitespace-nowrap">{label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
