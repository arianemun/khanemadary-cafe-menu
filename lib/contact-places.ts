import { LANGUAGES } from "./constants";
import type { Place } from "./types";

export type PlaceTranslation = {
  language: string;
  title?: string;
  address: string;
};

export type StoredPlace = {
  title?: string;
  address?: string;
  coordinates?: [number, number];
  translations?: PlaceTranslation[];
  type?: string;
};

function pickTranslation<T extends { language: string }>(
  translations: T[],
  lang: string,
  fallback = "fa"
): T | undefined {
  return (
    translations.find((t) => t.language === lang) ??
    translations.find((t) => t.language === fallback)
  );
}

export function getPlaceTranslations(
  place: StoredPlace,
  contactExtras?: { addressEn?: string }
): PlaceTranslation[] {
  if (place.translations?.length) {
    return LANGUAGES.map((l) => {
      const existing = place.translations!.find((t) => t.language === l.code);
      return existing ?? { language: l.code, address: "" };
    });
  }

  const faAddress = place.address ?? "";
  const enAddress = contactExtras?.addressEn ?? "";

  return LANGUAGES.map((l) => ({
    language: l.code,
    address:
      l.code === "fa" ? faAddress : l.code === "en" ? enAddress : "",
  }));
}

export function placeToLocale(
  place: StoredPlace,
  lang: string,
  contactExtras?: { addressEn?: string }
): Place {
  const translations = getPlaceTranslations(place, contactExtras);
  const tr = pickTranslation(translations, lang);
  const fa = pickTranslation(translations, "fa");

  return {
    address: tr?.address || fa?.address || "",
    coordinates: (place.coordinates ?? [0, 0]) as [number, number],
  };
}

export function updatePlaceTranslation(
  places: StoredPlace[],
  placeIndex: number,
  language: string,
  field: "address",
  value: string
): StoredPlace[] {
  const place = places[placeIndex] ?? {};
  const translations = getPlaceTranslations(place);
  const idx = translations.findIndex((t) => t.language === language);

  if (idx >= 0) {
    translations[idx] = { ...translations[idx], [field]: value };
  }

  const fa = translations.find((t) => t.language === "fa");
  const next = [...places];
  next[placeIndex] = {
    ...place,
    translations,
    title: fa?.title ?? "",
    address: fa?.address ?? "",
  };
  return next;
}
