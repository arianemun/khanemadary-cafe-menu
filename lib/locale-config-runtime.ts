import type { NextRequest } from "next/server";
import type { AppLocale } from "@/i18n/routing";
import {
  DEFAULT_LOCALE_RUNTIME_CONFIG,
  LOCALE_CONFIG_FILENAME,
  type LocaleRuntimeConfig,
} from "@/lib/locale-config";

const LOCALE_CONFIG_TTL_MS = 30_000;

let localeConfigCache: { data: LocaleRuntimeConfig; expiresAt: number } | null = null;

export async function getLocaleRuntimeConfig(
  request: NextRequest
): Promise<LocaleRuntimeConfig> {
  const now = Date.now();
  if (localeConfigCache && localeConfigCache.expiresAt > now) {
    return localeConfigCache.data;
  }

  try {
    const url = new URL(`/${LOCALE_CONFIG_FILENAME}`, request.nextUrl.origin);
    const response = await fetch(url, { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as LocaleRuntimeConfig;
      localeConfigCache = {
        data: data,
        expiresAt: now + LOCALE_CONFIG_TTL_MS,
      };
      return data;
    }
  } catch {
    // Fall back to static defaults when the config file is unavailable.
  }

  return DEFAULT_LOCALE_RUNTIME_CONFIG;
}

export function getLocaleFromPathname(pathname: string): AppLocale | null {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  if (!match) return null;
  const locale = match[1];
  return locale as AppLocale;
}
