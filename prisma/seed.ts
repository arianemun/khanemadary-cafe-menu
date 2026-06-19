import { PrismaClient } from "@prisma/client";
import referenceContent from "../reference-content.json";

const prisma = new PrismaClient();

const LANGUAGES = ["fa", "en", "ar", "zh", "ru", "tr"] as const;

const CATEGORY_ORDER = [
  "ytoZYeGy6DpOPco7Cat2Q",
  "uHrR3b7EqRu5QA3kbs1t5",
  "p8FrmXcG6dwoQXm0ErXt6",
];

const HOT_CHOCOLATE_IDS = new Set([
  "3mY829qa7iTCuQNoT-_2a",
  "w0HUM7bFCeh9_prgeyug2",
  "cyRA0xDKzdrTaeRAB2l5q",
  "cH2bf0A0ezUvI5H5J6Lkr",
  "Kw7vzDM4hS7b_cxl9xe2B",
  "aXOwLrSbxQKotxB_ycxRu",
  "T6L4hD8jmbmHj9ZhkCTLC",
]);

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  await prisma.discount.deleteMany();
  await prisma.itemTranslation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.event.deleteMany();
  await prisma.setting.deleteMany();

  const rawCategories = referenceContent.categories
    .filter((c) => c.name !== "راه‌های ارتباطی")
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.id) - CATEGORY_ORDER.indexOf(b.id));

  const categoryIdMap = new Map<string, string>();

  for (let i = 0; i < rawCategories.length; i++) {
    const c = rawCategories[i];
    const created = await prisma.category.create({
      data: {
        slug: slugify(c.nameEn || c.name),
        icon: c.icon,
        isActive: true,
        sortOrder: i,
        translations: {
          create: LANGUAGES.map((lang) => ({
            language: lang,
            name: lang === "fa" ? c.name : c.nameEn,
          })),
        },
      },
    });
    categoryIdMap.set(c.id, created.id);
  }

  const categoryByRefId = new Map(rawCategories.map((c) => [c.id, c]));
  let currentRefCategoryId = rawCategories[0]?.id ?? "";

  const menuItems = referenceContent.menuItems
    .filter((item) => item.name && item.price)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    if (item.categoryId && categoryByRefId.has(item.categoryId)) {
      currentRefCategoryId = item.categoryId;
    } else if (HOT_CHOCOLATE_IDS.has(item.id)) {
      currentRefCategoryId = "uHrR3b7EqRu5QA3kbs1t5";
    }

    const categoryId = categoryIdMap.get(currentRefCategoryId);
    if (!categoryId) continue;

    const nameEn =
      item.description?.split("\n").pop() || item.description || item.name;

    await prisma.menuItem.create({
      data: {
        categoryId,
        mainImage: item.image,
        galleryImages: JSON.stringify(item.image ? [item.image] : []),
        basePrice: item.price,
        isActive: true,
        isAvailable: item.available,
        sortOrder: i,
        translations: {
          create: LANGUAGES.map((lang) => ({
            language: lang,
            name: lang === "fa" ? item.name : nameEn,
            description: lang === "fa" ? item.description : nameEn,
            ingredients: lang === "fa" ? item.ingredients : nameEn,
          })),
        },
      },
    });
  }

  const settings = {
    general: {
      cafeName: referenceContent.cafe.name,
      cafeNameEn: referenceContent.cafe.nameEn,
      logo: referenceContent.cafe.logo,
      tagline: referenceContent.cafe.tagline,
      welcomeMessageFa: referenceContent.cafe.aiWelcomeMessage,
      welcomeMessageEn: "Hello, I am the smart assistant of Saedinia Cafe",
      announcement: referenceContent.announcement ?? { enabled: false },
    },
    contact: {
      phone: referenceContent.contacts[0]?.value ?? "02126878209",
      instagram: referenceContent.links[0]?.value ?? "saediniacafe",
      telegram: "",
      email: "",
      addressFa: referenceContent.places[0]?.address ?? "",
      addressEn: referenceContent.places[0]?.address ?? "",
      places: referenceContent.places,
      workingHours: referenceContent.workingHours,
    },
    maps: referenceContent.places.reduce(
      (acc, place) => {
        const [lat, lng] = place.coordinates;
        acc.google = `https://www.google.com/maps?q=${lat},${lng}`;
        acc.waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        acc.neshan = `https://neshan.org/maps/@${lat},${lng},16z`;
        acc.balad = `https://balad.ir/location?lat=${lat}&lng=${lng}`;
        return acc;
      },
      { google: "", waze: "", neshan: "", balad: "" } as Record<string, string>
    ),
    languages: {
      enabled: ["fa", "en", "ar", "zh", "ru", "tr"],
      default: "fa",
    },
    hero: referenceContent.heroVideo,
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.create({
      data: { key, value: JSON.stringify(value) },
    });
  }

  console.log(`Seeded ${rawCategories.length} categories, ${menuItems.length} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
