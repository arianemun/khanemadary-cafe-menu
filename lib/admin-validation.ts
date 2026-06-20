export const REQUIRED_TRANSLATION_LANGUAGES = ["fa", "en"] as const;

export type RequiredTranslationLanguage =
  (typeof REQUIRED_TRANSLATION_LANGUAGES)[number];

export function isRequiredTranslationLanguage(code: string): boolean {
  return REQUIRED_TRANSLATION_LANGUAGES.includes(
    code as RequiredTranslationLanguage
  );
}

export function validateTranslationNames(
  translations: Array<{ language: string; name?: string | null }>
): RequiredTranslationLanguage[] {
  const missing: RequiredTranslationLanguage[] = [];
  for (const code of REQUIRED_TRANSLATION_LANGUAGES) {
    const name = translations.find((t) => t.language === code)?.name?.trim();
    if (!name) missing.push(code);
  }
  return missing;
}
