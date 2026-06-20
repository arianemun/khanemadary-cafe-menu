export const DEFAULT_MENU_COLOR = "#3f51b5";

export const LANGUAGES = [
  { code: "fa", label: "فارسی" },
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ru", label: "Русский" },
  { code: "tr", label: "Türkçe" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
