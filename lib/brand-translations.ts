import { LANGUAGES } from "./constants";

export type BrandTextTranslation = {
  language: string;
  value: string;
};

export function normalizeCafeNameTranslations(
  general: Record<string, unknown>
): BrandTextTranslation[] {
  const stored = general.cafeNameTranslations as BrandTextTranslation[] | undefined;
  if (Array.isArray(stored) && stored.length > 0) return stored;

  const legacy: BrandTextTranslation[] = [];
  const fa = (general.cafeName as string | undefined)?.trim();
  const en = (general.cafeNameEn as string | undefined)?.trim();
  if (fa) legacy.push({ language: "fa", value: fa });
  if (en) legacy.push({ language: "en", value: en });
  return legacy;
}

export function normalizeTaglineTranslations(
  general: Record<string, unknown>
): BrandTextTranslation[] {
  const stored = general.taglineTranslations as BrandTextTranslation[] | undefined;
  if (Array.isArray(stored) && stored.length > 0) return stored;

  const tagline = (general.tagline as string | undefined)?.trim();
  if (!tagline) return [];
  return LANGUAGES.map((lang) => ({ language: lang.code, value: tagline }));
}

export function pickBrandTranslation(
  translations: BrandTextTranslation[],
  lang: string,
  fallbackLang = "fa"
): string {
  return (
    translations.find((t) => t.language === lang)?.value?.trim() ||
    translations.find((t) => t.language === fallbackLang)?.value?.trim() ||
    translations.find((t) => t.language === "en")?.value?.trim() ||
    translations[0]?.value?.trim() ||
    ""
  );
}

export function getBrandTranslationValue(
  translations: BrandTextTranslation[],
  language: string
): string {
  return translations.find((t) => t.language === language)?.value ?? "";
}

export function updateBrandTranslation(
  translations: BrandTextTranslation[],
  language: string,
  value: string
): BrandTextTranslation[] {
  const next = [...translations];
  const idx = next.findIndex((t) => t.language === language);
  if (idx >= 0) next[idx] = { language, value };
  else next.push({ language, value });
  return next;
}

export function getAdminBrandLanguages(enabled?: string[]) {
  if (enabled?.length) {
    return LANGUAGES.filter((lang) => enabled.includes(lang.code));
  }
  return [...LANGUAGES];
}

export function syncLegacyBrandFields(general: Record<string, unknown>) {
  const cafeNameTranslations = normalizeCafeNameTranslations(general);
  const taglineTranslations = normalizeTaglineTranslations(general);

  return {
    ...general,
    cafeNameTranslations,
    taglineTranslations,
    cafeName: pickBrandTranslation(cafeNameTranslations, "fa"),
    cafeNameEn: pickBrandTranslation(cafeNameTranslations, "en"),
    tagline: pickBrandTranslation(taglineTranslations, "fa"),
  };
}
