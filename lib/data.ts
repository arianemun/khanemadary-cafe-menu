import type { Locale } from "./types";
import { prisma } from "./prisma";
import {
  calculateDiscountedPrice,
  getActiveDiscount,
  normalizeDiscount,
} from "./discount";
import type {
  AnnouncementCard,
  Category,
  EventCard,
  HeaderBackgroundMode,
  HeroMediaType,
  MenuItem,
  SiteSettings,
} from "./types";
import { DEFAULT_MENU_COLOR } from "./constants";
import { resolveElementBorderRadius } from "./element-radius";
import { parseCategoryItemDisplayMode } from "./category-item-display";
import { resolveEventOverlayOpacity } from "./event-overlay";
import { resolveHeroOverlayOpacity } from "./hero-overlay";
import { resolveMenuMaxWidth } from "./menu-width";
import { placeToLocale, type StoredPlace } from "./contact-places";
import { normalizeWorldCupSettings } from "./world-cup-settings";
import { normalizeMapsSettings } from "./maps-settings";
import { localeConfigFromSettings } from "./locale-config";
import {
  normalizeCafeNameTranslations,
  normalizeTaglineTranslations,
  pickBrandTranslation,
} from "./brand-translations";
import {
  isCafeOpen,
  normalizeWorkingHoursSchedule,
  type WorkingHoursConfig,
} from "./working-hours";

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

export async function getCategories(lang = "fa"): Promise<Category[]> {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    include: { translations: true, _count: { select: { items: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((cat) => {
    const tr = pickTranslation(cat.translations, lang);
    const trEn = pickTranslation(cat.translations, "en");
    return {
      id: cat.id,
      slug: cat.slug,
      icon: cat.icon,
      name: tr?.name ?? cat.slug,
      nameEn: trEn?.name ?? cat.slug,
      sortOrder: cat.sortOrder,
      itemCount: cat._count.items,
      itemDisplayMode: parseCategoryItemDisplayMode(cat.itemDisplayMode),
      itemDisplayOddBackground: cat.itemDisplayOddBackground,
    };
  });
}

export async function getMenuItems(
  categoryId?: string,
  lang = "fa"
): Promise<MenuItem[]> {
  const rows = await prisma.menuItem.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      translations: true,
      discounts: { where: { isActive: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((item) => {
    const tr = pickTranslation(item.translations, lang);
    const trEn = pickTranslation(item.translations, "en");
    const discounts = item.discounts.map(normalizeDiscount);
    const activeDiscount = getActiveDiscount(discounts);
    const basePrice = item.basePrice;
    const discountedPrice = activeDiscount
      ? calculateDiscountedPrice(basePrice, activeDiscount)
      : null;

    let galleryImages: string[] = [];
    try {
      const parsed = JSON.parse(item.galleryImages);
      galleryImages = Array.isArray(parsed)
        ? parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
        : [];
    } catch {
      galleryImages = [];
    }

    return {
      id: item.id,
      categoryId: item.categoryId ?? "",
      slug: item.id,
      name: tr?.name ?? "",
      nameEn: trEn?.name ?? "",
      description: tr?.description ?? "",
      ingredients: tr?.ingredients ?? "",
      price: basePrice,
      preparationMinutes: item.preparationMinutes,
      image: item.mainImage,
      galleryImages,
      available: item.isAvailable,
      sortOrder: item.sortOrder,
      discountedPrice:
        discountedPrice !== null && discountedPrice < basePrice
          ? discountedPrice
          : null,
    };
  });
}

export async function getMenuItemById(
  id: string,
  lang = "fa"
): Promise<MenuItem | undefined> {
  const items = await getMenuItems(undefined, lang);
  return items.find((item) => item.id === id);
}

export async function getSettings(key: string): Promise<unknown> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (!row) return null;
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.setting.findMany();
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

export async function getEvents(): Promise<EventCard[]> {
  const rows = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((e) => ({
    id: e.id,
    image: e.image,
    video: e.video,
    title: e.title ?? "",
    description: e.description ?? "",
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    overlayOpacity: resolveEventOverlayOpacity(e.overlayOpacity),
    active: e.isActive,
  }));
}

export async function getAnnouncements(lang = "fa"): Promise<AnnouncementCard[]> {
  const rows = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const useFa = lang === "fa" || lang === "ar";

  return rows
    .map((row) => {
      const title = useFa
        ? (row.titleFa ?? row.titleEn ?? "")
        : (row.titleEn ?? row.titleFa ?? "");
      const message = useFa
        ? (row.messageFa ?? row.messageEn ?? "")
        : (row.messageEn ?? row.messageFa ?? "");

      return {
        id: row.id,
        title,
        message,
        image: row.image,
        color: row.color,
        link: row.link,
        durationSeconds: row.durationSeconds,
        maxDisplayCount: row.maxDisplayCount,
        active: row.isActive,
      };
    })
    .filter((row) => row.title || row.message);
}

export async function getSiteSettings(lang = "fa"): Promise<SiteSettings> {
  const all = await getAllSettings();
  const general = (all.general ?? {}) as Record<string, unknown>;
  const contact = (all.contact ?? {}) as Record<string, unknown>;
  const hero = (all.hero ?? {}) as Record<string, unknown>;
  const worldCup = normalizeWorldCupSettings(all.worldCup);
  const languages = localeConfigFromSettings(
    all.languages as { enabled?: Locale[]; default?: Locale } | undefined
  );
  const rawWorkingHours = (contact.workingHours ?? {}) as WorkingHoursConfig & {
    openMessage?: string;
    closedMessage?: string;
    note?: string;
    openColor?: string;
  };
  const forceClosed = general.forceClosed === true;
  const scrollToTopEnabled = general.scrollToTopEnabled !== false;
  const scrollProgressEnabled = general.scrollProgressEnabled !== false;
  const shareEnabled = general.shareEnabled !== false;
  const headerBackgroundRaw = general.headerBackground as string | undefined;
  const headerBackground: HeaderBackgroundMode =
    headerBackgroundRaw === "glass" ||
    headerBackgroundRaw === "white" ||
    headerBackgroundRaw === "white-to-glass"
      ? headerBackgroundRaw
      : "white-to-glass";
  const categoryTabsBackgroundRaw = general.categoryTabsBackground as
    | string
    | undefined;
  const categoryTabsBackground: HeaderBackgroundMode =
    categoryTabsBackgroundRaw === "glass" ||
    categoryTabsBackgroundRaw === "white" ||
    categoryTabsBackgroundRaw === "white-to-glass"
      ? categoryTabsBackgroundRaw
      : "glass";
  const menuMaxWidth = resolveMenuMaxWidth(
    general.menuMaxWidth as string | undefined
  );
  const elementBorderRadius = resolveElementBorderRadius(
    general.elementBorderRadius
  );
  const places = (contact.places ?? []) as StoredPlace[];
  const contactExtras = {
    addressEn: contact.addressEn as string | undefined,
  };

  const events = await getEvents();
  const announcements = await getAnnouncements(lang);
  const cafeNameTranslations = normalizeCafeNameTranslations(general);
  const taglineTranslations = normalizeTaglineTranslations(general);

  return {
    cafeName: pickBrandTranslation(cafeNameTranslations, lang),
    cafeNameEn: pickBrandTranslation(cafeNameTranslations, "en"),
    logo: (general.logo as string) ?? "",
    favicon: (general.favicon as string) ?? "",
    menuColor: (general.menuColor as string) || DEFAULT_MENU_COLOR,
    tagline: pickBrandTranslation(taglineTranslations, lang),
    phone: (contact.phone as string) ?? "",
    instagram: (contact.instagram as string) ?? "",
    telegram: (contact.telegram as string) ?? "",
    places: places.map((p) => placeToLocale(p, lang, contactExtras)),
    workingHours: {
      openMessage: rawWorkingHours.openMessage ?? "",
      closedMessage: rawWorkingHours.closedMessage ?? "",
      note: rawWorkingHours.note ?? "",
      start: rawWorkingHours.hours
        ? `${rawWorkingHours.hours.hs}:${String(rawWorkingHours.hours.ms).padStart(2, "0")}`
        : "",
      end: rawWorkingHours.hours
        ? `${rawWorkingHours.hours.he}:${String(rawWorkingHours.hours.me).padStart(2, "0")}`
        : "",
      openColor: rawWorkingHours.openColor ?? "#3fda2b",
      schedule: normalizeWorkingHoursSchedule(rawWorkingHours),
      config: rawWorkingHours,
    },
    forceClosed,
    isOpen: isCafeOpen(rawWorkingHours, forceClosed),
    scrollToTopEnabled,
    scrollProgressEnabled,
    shareEnabled,
    headerBackground,
    categoryTabsBackground,
    menuMaxWidth,
    elementBorderRadius,
    heroMediaType: (() => {
      const raw = hero.mediaType as string | undefined;
      if (raw === "image" || raw === "video") return raw;
      const videoUrl = (hero.videoUrl as string) ?? "";
      return videoUrl ? "video" : "image";
    })() satisfies HeroMediaType,
    heroVideoPoster: (hero.poster as string) ?? null,
    heroVideoUrl: (hero.videoUrl as string) ?? null,
    heroOverlayOpacity: resolveHeroOverlayOpacity(hero.overlayOpacity),
    announcements,
    events,
    enabledLanguages: languages.enabled,
    defaultLanguage: languages.default,
    maps: normalizeMapsSettings(all.maps),
    worldCup,
  };
}

export async function getMenuData(lang = "fa") {
  const [categories, items, settings] = await Promise.all([
    getCategories(lang),
    getMenuItems(undefined, lang),
    getSiteSettings(lang),
  ]);
  return { categories, items, settings };
}
