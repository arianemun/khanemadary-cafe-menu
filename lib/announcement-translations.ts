type AnnouncementTranslationRow = {
  language: string;
  title?: string | null;
  message?: string | null;
};

function pickTranslation(
  translations: AnnouncementTranslationRow[] | undefined,
  lang: string
): AnnouncementTranslationRow | undefined {
  if (!translations?.length) return undefined;
  const fallbacks =
    lang === "fa" || lang === "ar"
      ? [lang, "fa", "ar", "en"]
      : [lang, "en", "fa"];
  for (const code of fallbacks) {
    const match = translations.find((row) => row.language === code);
    if (match?.title?.trim() || match?.message?.trim()) return match;
  }
  return translations.find((row) => row.title?.trim() || row.message?.trim());
}

export function getAnnouncementLocalizedText(
  translations: AnnouncementTranslationRow[] | undefined,
  lang: string
) {
  const match = pickTranslation(translations, lang);
  return {
    title: match?.title?.trim() ?? "",
    message: match?.message?.trim() ?? "",
  };
}

export function getAnnouncementAdminPreviewText(
  translations: AnnouncementTranslationRow[] | undefined,
  locale: "fa" | "en"
) {
  return getAnnouncementLocalizedText(translations, locale);
}
