import { locales, type AppLocale } from "@/i18n/routing";

export type LocaleRuntimeConfig = {
  default: AppLocale;
  enabled: AppLocale[];
};

export const LOCALE_CONFIG_FILENAME = "locale-config.json";

const ALL_LOCALES = [...locales] as AppLocale[];

export const DEFAULT_LOCALE_RUNTIME_CONFIG: LocaleRuntimeConfig = {
  default: "fa",
  enabled: ALL_LOCALES,
};

export function normalizeLocaleRuntimeConfig(
  config?: Partial<LocaleRuntimeConfig> | null
): LocaleRuntimeConfig {
  const enabled = (config?.enabled ?? ALL_LOCALES).filter((code): code is AppLocale =>
    ALL_LOCALES.includes(code as AppLocale)
  );
  const enabledLocales = enabled.length > 0 ? enabled : (["fa"] as AppLocale[]);
  let defaultLocale = config?.default ?? "fa";
  if (!enabledLocales.includes(defaultLocale)) {
    defaultLocale = enabledLocales[0];
  }
  return {
    default: defaultLocale,
    enabled: enabledLocales,
  };
}

export function localeConfigFromSettings(
  languages?: { enabled?: string[]; default?: string } | null
): LocaleRuntimeConfig {
  return normalizeLocaleRuntimeConfig({
    default: languages?.default as AppLocale | undefined,
    enabled: languages?.enabled as AppLocale[] | undefined,
  });
}

export function isAppLocale(value: string): value is AppLocale {
  return ALL_LOCALES.includes(value as AppLocale);
}
