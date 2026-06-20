import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MAP_PATH = path.join(process.cwd(), "scripts", "image-url-map.json");

function replaceInValue(value: unknown, map: Record<string, string>): unknown {
  if (typeof value === "string" && map[value]) {
    return map[value];
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceInValue(item, map));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceInValue(val, map);
    }
    return out;
  }
  return value;
}

function replaceString(value: string | null | undefined, map: Record<string, string>) {
  if (!value) return value ?? null;
  return map[value] ?? value;
}

async function main() {
  const map = JSON.parse(await readFile(MAP_PATH, "utf-8")) as Record<string, string>;

  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    const icon = replaceString(cat.icon, map);
    if (icon !== cat.icon) {
      await prisma.category.update({ where: { id: cat.id }, data: { icon } });
    }
  }

  const items = await prisma.menuItem.findMany();
  for (const item of items) {
    const mainImage = replaceString(item.mainImage, map);
    let galleryImages = item.galleryImages;
    try {
      const parsed = JSON.parse(item.galleryImages) as unknown;
      galleryImages = JSON.stringify(replaceInValue(parsed, map));
    } catch {
      galleryImages = item.galleryImages;
    }
    if (mainImage !== item.mainImage || galleryImages !== item.galleryImages) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { mainImage, galleryImages },
      });
    }
  }

  const events = await prisma.event.findMany();
  for (const event of events) {
    const image = replaceString(event.image, map);
    if (image !== event.image) {
      await prisma.event.update({ where: { id: event.id }, data: { image } });
    }
  }

  const settings = await prisma.setting.findMany();
  for (const setting of settings) {
    try {
      const parsed = JSON.parse(setting.value) as unknown;
      const next = replaceInValue(parsed, map);
      const value = JSON.stringify(next);
      if (value !== setting.value) {
        await prisma.setting.update({ where: { key: setting.key }, data: { value } });
      }
    } catch {
      const value = replaceString(setting.value, map);
      if (value && value !== setting.value) {
        await prisma.setting.update({ where: { key: setting.key }, data: { value: value } });
      }
    }
  }

  console.log("Database image URLs migrated to local paths.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
