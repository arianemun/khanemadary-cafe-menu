import { prisma } from "../lib/prisma";
import { syncLegacyBrandFields } from "../lib/brand-translations";
import { localeConfigFromSettings } from "../lib/locale-config";
import { writeLocaleRuntimeConfig } from "../lib/locale-config.server";
import {
  ALL_TARGET_LANGS,
  BRAND_I18N,
  DUAL_PRICE_LABELS,
  PLACE_I18N,
  resolveCategoryI18n,
  resolveItemI18n,
  type TargetLang,
} from "./menu-i18n-data";

const ALL_LANGS = ["fa", ...ALL_TARGET_LANGS] as const;

const PLACE_ADDRESS_BY_LANG: Record<TargetLang, string> = {
  en: "6 Najafi Alley, Fazaeli Alley, Farshadi Street, Ostandari Street, Isfahan, Iran",
  ar: "إيران، أصفهان، شارع الاستاندارية، شارع فرشادي، زقاق فضائلي، زقاق نجفي، رقم 6",
  zh: "伊朗伊斯法罕省，伊斯法罕市，奥斯坦达里大街，法尔沙迪街，法扎伊利小巷，纳贾菲小巷，6号",
  ru: "Иран, г. Исфахан, ул. Эстандари, ул. Фаршади, пер. Фазаели, пер. Наджафи, д. 6",
  tr: "Iran, Isfahan, Ostandari Caddesi, Farsadi Caddesi, Fazaeli Sokagi, Necafi Sokagi, No: 6",
};

async function updateCategoryTranslations() {
  const categories = await prisma.category.findMany({ include: { translations: true } });
  let updated = 0;

  for (const category of categories) {
    const fa = category.translations.find((row) => row.language === "fa");
    if (!fa?.name) continue;

    const map = resolveCategoryI18n(fa.name);
    if (!map) {
      console.warn(`Missing category translation map for: ${fa.name}`);
      continue;
    }

    for (const lang of ALL_TARGET_LANGS) {
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_language: { categoryId: category.id, language: lang },
        },
        update: { name: map[lang] },
        create: { categoryId: category.id, language: lang, name: map[lang] },
      });
    }
    updated += 1;
  }

  return updated;
}

async function updateItemTranslations() {
  const items = await prisma.menuItem.findMany({ include: { translations: true } });
  let updated = 0;
  let missing = 0;

  for (const item of items) {
    const fa = item.translations.find((row) => row.language === "fa");
    if (!fa?.name) continue;

    const map = resolveItemI18n(fa.name);
    if (!map) {
      console.warn(`Missing item translation map for: ${fa.name}`);
      missing += 1;
      continue;
    }

    for (const lang of ALL_LANGS) {
      const name = lang === "fa" ? fa.name.trim() : map[lang as TargetLang];
      const priceLabels =
        item.secondaryPriceEnabled && DUAL_PRICE_LABELS[lang as keyof typeof DUAL_PRICE_LABELS];

      await prisma.itemTranslation.upsert({
        where: {
          itemId_language: { itemId: item.id, language: lang },
        },
        update: {
          name,
          description: name,
          ingredients: name,
          primaryPriceLabel: priceLabels?.primary ?? null,
          secondaryPriceLabel: priceLabels?.secondary ?? null,
        },
        create: {
          itemId: item.id,
          language: lang,
          name,
          description: name,
          ingredients: name,
          primaryPriceLabel: priceLabels?.primary ?? null,
          secondaryPriceLabel: priceLabels?.secondary ?? null,
        },
      });
    }
    updated += 1;
  }

  return { updated, missing };
}

async function updateGeneralSettings() {
  const row = await prisma.setting.findUnique({ where: { key: "general" } });
  if (!row) return false;

  const general = JSON.parse(row.value) as Record<string, unknown>;
  const faName =
    (general.cafeNameTranslations as { language: string; value: string }[] | undefined)?.find(
      (entry) => entry.language === "fa"
    )?.value ||
    (general.cafeName as string | undefined) ||
    "کافه خانه مادری";

  const faTagline =
    (general.taglineTranslations as { language: string; value: string }[] | undefined)?.find(
      (entry) => entry.language === "fa"
    )?.value ||
    (general.tagline as string | undefined) ||
    faName;

  const cafeNameTranslations = [
    { language: "fa", value: faName },
    ...ALL_TARGET_LANGS.map((lang) => ({
      language: lang,
      value: BRAND_I18N.cafeName[lang],
    })),
  ];

  const taglineTranslations = [
    { language: "fa", value: faTagline },
    ...ALL_TARGET_LANGS.map((lang) => ({
      language: lang,
      value: BRAND_I18N.tagline[lang],
    })),
  ];

  const nextGeneral = syncLegacyBrandFields({
    ...general,
    cafeNameTranslations,
    taglineTranslations,
  });

  await prisma.setting.update({
    where: { key: "general" },
    data: { value: JSON.stringify(nextGeneral) },
  });

  return true;
}

async function updateContactSettings() {
  const row = await prisma.setting.findUnique({ where: { key: "contact" } });
  if (!row) return false;

  const contact = JSON.parse(row.value) as Record<string, unknown>;
  const places = (contact.places as Array<Record<string, unknown>>) ?? [];
  if (places.length === 0) return false;

  const faPlace = places[0];
  const faTranslations =
    (faPlace.translations as Array<{ language: string; title?: string; address?: string }>) ?? [];
  const faEntry = faTranslations.find((entry) => entry.language === "fa");

  const translations = [
    faEntry ?? { language: "fa", title: "عنوان", address: "" },
    ...ALL_TARGET_LANGS.map((lang) => ({
      language: lang,
      title: PLACE_I18N[lang],
      address: PLACE_ADDRESS_BY_LANG[lang],
    })),
  ];

  places[0] = { ...faPlace, translations };
  contact.places = places;

  await prisma.setting.update({
    where: { key: "contact" },
    data: { value: JSON.stringify(contact) },
  });

  return true;
}

async function updateAnnouncementTranslations() {
  const announcements = await prisma.announcement.findMany({
    include: { translations: true },
  });
  let updated = 0;

  for (const announcement of announcements) {
    const fa = announcement.translations.find((row) => row.language === "fa");
    if (!fa?.title?.trim() && !fa?.message?.trim()) continue;

    for (const lang of ALL_TARGET_LANGS) {
      await prisma.announcementTranslation.upsert({
        where: {
          announcementId_language: {
            announcementId: announcement.id,
            language: lang,
          },
        },
        update: {
          title: fa.title,
          message: fa.message,
        },
        create: {
          announcementId: announcement.id,
          language: lang,
          title: fa.title,
          message: fa.message,
        },
      });
    }
    updated += 1;
  }

  return updated;
}

async function enableAllLanguages() {
  const languages = {
    enabled: [...ALL_LANGS],
    default: "fa",
  };

  await prisma.setting.upsert({
    where: { key: "languages" },
    update: { value: JSON.stringify(languages) },
    create: { key: "languages", value: JSON.stringify(languages) },
  });

  writeLocaleRuntimeConfig(localeConfigFromSettings(languages));
}

async function main() {
  const categories = await updateCategoryTranslations();
  const items = await updateItemTranslations();
  const general = await updateGeneralSettings();
  const contact = await updateContactSettings();
  const announcements = await updateAnnouncementTranslations();

  await enableAllLanguages();

  console.log(`Updated ${categories} categories.`);
  console.log(`Updated ${items.updated} items (${items.missing} missing maps).`);
  console.log(`General settings: ${general ? "updated" : "skipped"}`);
  console.log(`Contact settings: ${contact ? "updated" : "skipped"}`);
  console.log(`Announcements: ${announcements}`);
  console.log("All languages enabled: fa, en, ar, zh, ru, tr");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
