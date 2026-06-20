import type { Metadata } from "next";
import type { SiteSettings } from "./types";

const DEFAULT_FAVICON = "/favicon.ico";
const FALLBACK_TITLE = "Menu";
const DEFAULT_SITE_URL = "http://localhost:3000";

export function getMetadataBase(): URL {
  const url =
    process.env.SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    DEFAULT_SITE_URL;
  return new URL(url);
}

type MetadataSettings = Pick<
  SiteSettings,
  "favicon" | "cafeName" | "cafeNameEn" | "tagline" | "logo"
>;

export function getCafeDisplayName(
  settings: Pick<SiteSettings, "cafeName" | "cafeNameEn">
): string {
  return settings.cafeName.trim() || settings.cafeNameEn.trim() || FALLBACK_TITLE;
}

export function getSiteDescription(
  settings: Pick<SiteSettings, "tagline">
): string | undefined {
  const description = settings.tagline?.trim();
  return description || undefined;
}

export function buildSiteIcons(favicon?: string): Metadata["icons"] {
  const href = favicon?.trim() || DEFAULT_FAVICON;
  return {
    icon: [{ url: href }],
    shortcut: [{ url: href }],
    apple: [{ url: href }],
  };
}

export function buildSiteMetadata(settings: MetadataSettings): Metadata {
  const title = getCafeDisplayName(settings);
  const description = getSiteDescription(settings);
  const logo = settings.logo?.trim();

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: buildSiteIcons(settings.favicon),
    openGraph: {
      title,
      description,
      type: "website",
      ...(logo ? { images: [{ url: logo }] } : {}),
    },
  };
}
