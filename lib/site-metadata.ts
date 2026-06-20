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
  "favicon" | "cafeName" | "cafeNameEn" | "tagline" | "welcomeMessage" | "logo"
>;

export function getCafeDisplayName(
  settings: Pick<SiteSettings, "cafeName" | "cafeNameEn">,
  locale: string
): string {
  const name =
    locale === "fa"
      ? settings.cafeName || settings.cafeNameEn
      : settings.cafeNameEn || settings.cafeName;
  return name.trim() || FALLBACK_TITLE;
}

export function getSiteDescription(
  settings: Pick<SiteSettings, "tagline" | "welcomeMessage">
): string | undefined {
  const description =
    settings.tagline?.trim() || settings.welcomeMessage?.trim();
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

export function buildSiteMetadata(
  settings: MetadataSettings,
  locale: string
): Metadata {
  const title = getCafeDisplayName(settings, locale);
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
