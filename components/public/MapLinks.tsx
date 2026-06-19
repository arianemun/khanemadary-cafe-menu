"use client";

import { useTranslations } from "next-intl";

interface MapLinksProps {
  coordinates: [number, number];
}

export function MapLinks({ coordinates }: MapLinksProps) {
  const t = useTranslations("maps");
  const [lat, lng] = coordinates;

  const links = [
    {
      label: t("neshan"),
      href: `https://neshan.org/maps/@${lat},${lng},16z`,
    },
    {
      label: t("balad"),
      href: `https://balad.ir/location?lat=${lat}&lng=${lng}`,
    },
    {
      label: t("google"),
      href: `https://www.google.com/maps?q=${lat},${lng}`,
    },
    {
      label: t("waze"),
      href: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-btn border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
