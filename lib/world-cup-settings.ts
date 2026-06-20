import {
  normalizeWorldCupBackgroundStyle,
  type WorldCupWidgetBackgroundStyle,
} from "./world-cup-widget-style";

export type { WorldCupWidgetBackgroundStyle } from "./world-cup-widget-style";

export const DEFAULT_WORLD_CUP_DATA_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

export const DEFAULT_WORLD_CUP_TIMEZONE = "Asia/Tehran";

export interface WorldCupSettings {
  enabled: boolean;
  dataUrl: string;
  timezone: string;
  maxMatches: number;
  titleFa: string;
  titleEn: string;
  backgroundStyle: WorldCupWidgetBackgroundStyle;
}

export function normalizeWorldCupSettings(
  raw: unknown
): WorldCupSettings {
  const config = (raw ?? {}) as Record<string, unknown>;
  const maxMatchesRaw = Number(config.maxMatches);
  const maxMatches =
    Number.isFinite(maxMatchesRaw) && maxMatchesRaw > 0
      ? Math.min(Math.floor(maxMatchesRaw), 10)
      : 5;

  return {
    enabled: config.enabled === true,
    dataUrl:
      typeof config.dataUrl === "string" && config.dataUrl.trim()
        ? config.dataUrl.trim()
        : DEFAULT_WORLD_CUP_DATA_URL,
    timezone:
      typeof config.timezone === "string" && config.timezone.trim()
        ? config.timezone.trim()
        : DEFAULT_WORLD_CUP_TIMEZONE,
    maxMatches,
    titleFa:
      typeof config.titleFa === "string" && config.titleFa.trim()
        ? config.titleFa.trim()
        : "جام جهانی ۲۰۲۶",
    titleEn:
      typeof config.titleEn === "string" && config.titleEn.trim()
        ? config.titleEn.trim()
        : "World Cup 2026",
    backgroundStyle: normalizeWorldCupBackgroundStyle(config.backgroundStyle),
  };
}
