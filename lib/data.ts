import type { Locale } from "./types";
import { prisma } from "./prisma";
import {
  calculateDiscountedPrice,
  getActiveDiscount,
  normalizeDiscount,
} from "./discount";
import type { Category, EventCard, MenuItem, SiteSettings } from "./types";

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
      galleryImages = JSON.parse(item.galleryImages);
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
    title: e.title ?? "",
    description: e.description ?? "",
    startDate: e.startDate?.toISOString() ?? null,
    endDate: e.endDate?.toISOString() ?? null,
    active: e.isActive,
  }));
}

export async function getSiteSettings(lang = "fa"): Promise<SiteSettings> {
  const all = await getAllSettings();
  const general = (all.general ?? {}) as Record<string, unknown>;
  const contact = (all.contact ?? {}) as Record<string, unknown>;
  const hero = (all.hero ?? {}) as Record<string, unknown>;
  const languages = (all.languages ?? {}) as {
    enabled?: Locale[];
    default?: Locale;
  };
  const workingHours = (contact.workingHours ?? {}) as {
    openMessage?: string;
    closedMessage?: string;
    note?: string;
    hours?: { hs: number; he: number; ms: number; me: number };
    openColor?: string;
  };
  const places = (contact.places ?? []) as Array<{
    title: string;
    address: string;
    coordinates: [number, number];
  }>;

  const events = await getEvents();

  return {
    cafeName: (general.cafeName as string) ?? "",
    cafeNameEn: (general.cafeNameEn as string) ?? "",
    logo: (general.logo as string) ?? "",
    tagline: (general.tagline as string) ?? "",
    welcomeMessage:
      lang === "fa"
        ? ((general.welcomeMessageFa as string) ?? "")
        : ((general.welcomeMessageEn as string) ?? ""),
    phone: (contact.phone as string) ?? "",
    instagram: (contact.instagram as string) ?? "",
    places: places.map((p) => ({
      title: p.title,
      address: p.address,
      coordinates: p.coordinates,
    })),
    workingHours: {
      openMessage: workingHours.openMessage ?? "",
      closedMessage: workingHours.closedMessage ?? "",
      note: workingHours.note ?? "",
      start: workingHours.hours
        ? `${workingHours.hours.hs}:${String(workingHours.hours.ms).padStart(2, "0")}`
        : "",
      end: workingHours.hours
        ? `${workingHours.hours.he}:${String(workingHours.hours.me).padStart(2, "0")}`
        : "",
      openColor: workingHours.openColor ?? "#3fda2b",
    },
    heroVideoPoster: (hero.poster as string) ?? null,
    heroVideoUrl: (hero.videoUrl as string) ?? null,
    announcement: (general.announcement as SiteSettings["announcement"]) ?? {
      enabled: false,
    },
    events,
    enabledLanguages: languages.enabled ?? ["fa", "en", "ar", "zh", "ru", "tr"],
    defaultLanguage: languages.default ?? "fa",
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
