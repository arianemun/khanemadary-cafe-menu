import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale = "fa-IR") {
  return new Intl.NumberFormat(locale).format(price);
}

export function formatNumber(value: number, locale = "fa-IR") {
  return new Intl.NumberFormat(locale).format(value);
}

export function getAdminIntlLocale(locale: "fa" | "en") {
  return locale === "fa" ? "fa-IR" : "en-US";
}

export function getAdminTranslationName(
  translations: { language: string; name: string }[] | undefined,
  locale: "fa" | "en",
  fallback = "—"
) {
  if (!translations?.length) return fallback;
  const other = locale === "fa" ? "en" : "fa";
  return (
    translations.find((t) => t.language === locale)?.name ??
    translations.find((t) => t.language === other)?.name ??
    translations[0]?.name ??
    fallback
  );
}

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function formatAdminDigits(value: string, locale: "fa" | "en" = "fa") {
  if (!value || locale !== "fa") return value;
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function formatAdminDisplayValue(
  value: string | number,
  locale: "fa" | "en" = "fa"
) {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "";
    return formatNumber(value, getAdminIntlLocale(locale));
  }
  return formatAdminDigits(value, locale);
}

export function adminFaDigitClass(locale: "fa" | "en", className?: string) {
  return cn(locale === "fa" && "admin-fa-digits", className);
}

/** Form controls that convert/display Persian digits — same size as sibling field text */
export function adminFaDigitFieldClass(locale: "fa" | "en", className?: string) {
  return cn(locale === "fa" && "admin-fa-digits", className);
}

export function normalizeAdminDigits(value: string) {
  if (!value) return value;
  return value.replace(/[۰-۹٠-٩]/g, (c) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(c);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(c);
    return arabicIndex >= 0 ? String(arabicIndex) : c;
  });
}

export function formatAdminTimeValue(value: string, locale: "fa" | "en" = "fa") {
  return formatAdminDigits(value, locale);
}

export function normalizeAdminTimeValue(value: string) {
  return normalizeAdminDigits(value);
}

export function formatAdminDate(
  date: Date | string | number,
  locale: "fa" | "en" = "fa"
) {
  const value = date instanceof Date ? date : new Date(date);
  if (locale === "fa") {
    const formatted = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(value);
    return formatAdminDigits(formatted, "fa");
  }
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}
