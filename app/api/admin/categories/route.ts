import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { validateTranslationNames } from "@/lib/admin-validation";
import { DEFAULT_CATEGORY_ITEM_DISPLAY_MODE } from "@/lib/category-item-display";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const categories = await prisma.category.findMany({
    include: { translations: true, _count: { select: { items: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { slug, icon, translations, isActive, itemDisplayMode, itemDisplayOddBackground } = body;

  const missing = validateTranslationNames(translations ?? []);
  if (missing.length) {
    return NextResponse.json({ error: "validation", missing }, { status: 400 });
  }

  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.category.create({
    data: {
      slug,
      icon: icon ?? null,
      isActive: isActive ?? true,
      itemDisplayMode: itemDisplayMode ?? DEFAULT_CATEGORY_ITEM_DISPLAY_MODE,
      itemDisplayOddBackground: itemDisplayOddBackground ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      translations: {
        create: (translations as Array<{ language: string; name: string }>).map(
          (t) => ({ language: t.language, name: t.name })
        ),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(category, { status: 201 });
}
