type ItemTranslationRow = {
  language: string;
  name?: string | null;
  description?: string | null;
  ingredients?: string | null;
  primaryPriceLabel?: string | null;
  secondaryPriceLabel?: string | null;
};

function translationFallbackChain(lang: string): string[] {
  if (lang === "fa" || lang === "ar") return [lang, "fa", "ar", "en"];
  return [lang, "en", "fa"];
}

function pickField(
  translations: ItemTranslationRow[] | undefined,
  lang: string,
  field:
    | "name"
    | "description"
    | "ingredients"
    | "primaryPriceLabel"
    | "secondaryPriceLabel"
): string {
  if (!translations?.length) return "";
  for (const code of translationFallbackChain(lang)) {
    const row = translations.find((t) => t.language === code);
    const value = row?.[field]?.trim();
    if (value) return value;
  }
  return "";
}

export function getItemLocalizedText(
  translations: ItemTranslationRow[] | undefined,
  lang: string
) {
  return {
    name: pickField(translations, lang, "name"),
    description: pickField(translations, lang, "description"),
    ingredients: pickField(translations, lang, "ingredients"),
    primaryPriceLabel: pickField(translations, lang, "primaryPriceLabel"),
    secondaryPriceLabel: pickField(translations, lang, "secondaryPriceLabel"),
  };
}

export function getItemEnglishName(
  translations: ItemTranslationRow[] | undefined
): string {
  return pickField(translations, "en", "name");
}
