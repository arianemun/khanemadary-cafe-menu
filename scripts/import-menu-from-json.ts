import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const LANGUAGES = ["fa", "en", "ar", "zh", "ru", "tr"] as const;
const DEFAULT_CATEGORY = "چای و دمنوش";

type RawRow = Record<string, string>;

type ParsedItem = {
  name: string;
  basePrice: number;
  secondaryPrice?: number;
};

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getRowName(row: RawRow) {
  for (const [key, value] of Object.entries(row)) {
    if (key !== "") return value.trim();
  }
  return "";
}

function getRowPrice(row: RawRow) {
  return (row[""] ?? "").trim();
}

function parsePrice(priceStr: string): Pick<ParsedItem, "basePrice" | "secondaryPrice"> {
  if (priceStr.includes("/")) {
    const [first, second] = priceStr.split("/").map((part) => Number(part.trim()));
    const basePrice = Math.min(first, second);
    const secondaryPrice = Math.max(first, second);
    return { basePrice, secondaryPrice };
  }

  return { basePrice: Number(priceStr) };
}

function parseMenuRows(rows: RawRow[]) {
  let currentCategory = DEFAULT_CATEGORY;
  const categories = new Map<string, ParsedItem[]>();

  const ensureCategory = (name: string) => {
    if (!categories.has(name)) {
      categories.set(name, []);
    }
  };

  ensureCategory(currentCategory);

  for (const row of rows) {
    const name = getRowName(row);
    const priceStr = getRowPrice(row);

    if (!name) continue;

    if (!priceStr) {
      currentCategory = name;
      ensureCategory(currentCategory);
      continue;
    }

    const prices = parsePrice(priceStr);
    categories.get(currentCategory)!.push({
      name,
      ...prices,
    });
  }

  return categories;
}

async function clearMenuData() {
  await prisma.discount.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
}

async function importMenu(categories: Map<string, ParsedItem[]>) {
  const usedSlugs = new Set<string>();
  let categoryOrder = 0;

  for (const [categoryName, items] of categories) {
    let slug = slugify(categoryName) || `category-${categoryOrder + 1}`;
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${categoryOrder + 1}`;
    }
    usedSlugs.add(slug);

    const category = await prisma.category.create({
      data: {
        slug,
        icon: null,
        isActive: true,
        sortOrder: categoryOrder,
        translations: {
          create: LANGUAGES.map((language) => ({
            language,
            name: categoryName,
          })),
        },
      },
    });

    for (let itemOrder = 0; itemOrder < items.length; itemOrder++) {
      const item = items[itemOrder];
      const hasSecondaryPrice = item.secondaryPrice != null;

      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          mainImage: null,
          galleryImages: "[]",
          basePrice: item.basePrice,
          secondaryPriceEnabled: hasSecondaryPrice,
          secondaryPrice: hasSecondaryPrice ? item.secondaryPrice : null,
          isActive: true,
          isAvailable: true,
          sortOrder: itemOrder,
          translations: {
            create: LANGUAGES.map((language) => ({
              language,
              name: item.name,
              primaryPriceLabel: null,
              secondaryPriceLabel: hasSecondaryPrice ? "تست" : null,
            })),
          },
        },
      });
    }

    categoryOrder += 1;
  }
}

async function main() {
  const dataPath = path.join(__dirname, "menu-import-data.json");
  const rows = JSON.parse(readFileSync(dataPath, "utf8")) as RawRow[];
  const categories = parseMenuRows(rows);

  await clearMenuData();
  await importMenu(categories);

  const categoryCount = categories.size;
  const itemCount = [...categories.values()].reduce(
    (total, items) => total + items.length,
    0
  );

  console.log(`Imported ${categoryCount} categories and ${itemCount} items.`);
  for (const [name, items] of categories) {
    console.log(`- ${name}: ${items.length} items`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
