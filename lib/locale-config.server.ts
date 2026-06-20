import { readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  DEFAULT_LOCALE_RUNTIME_CONFIG,
  LOCALE_CONFIG_FILENAME,
  normalizeLocaleRuntimeConfig,
  type LocaleRuntimeConfig,
} from "./locale-config";

export function getLocaleConfigPublicPath() {
  return path.join(process.cwd(), "public", LOCALE_CONFIG_FILENAME);
}

export function readLocaleRuntimeConfig(): LocaleRuntimeConfig {
  try {
    const raw = readFileSync(getLocaleConfigPublicPath(), "utf8");
    return normalizeLocaleRuntimeConfig(JSON.parse(raw) as Partial<LocaleRuntimeConfig>);
  } catch {
    return DEFAULT_LOCALE_RUNTIME_CONFIG;
  }
}

export function writeLocaleRuntimeConfig(config: Partial<LocaleRuntimeConfig>) {
  const normalized = normalizeLocaleRuntimeConfig(config);
  writeFileSync(
    getLocaleConfigPublicPath(),
    `${JSON.stringify(normalized, null, 2)}\n`,
    "utf8"
  );
  return normalized;
}
