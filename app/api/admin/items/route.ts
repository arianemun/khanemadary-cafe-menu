import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const q = searchParams.get("q");

  const items = await prisma.menuItem.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            translations: {
              some: { name: { contains: q } },
            },
          }
        : {}),
    },
    include: { translations: true, category: { include: { translations: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const {
    categoryId,
    mainImage,
    galleryImages,
    basePrice,
    isActive,
    isAvailable,
    translations,
  } = body;

  const maxOrder = await prisma.menuItem.aggregate({ _max: { sortOrder: true } });

  const item = await prisma.menuItem.create({
    data: {
      categoryId: categoryId ?? null,
      mainImage: mainImage ?? null,
      galleryImages: JSON.stringify(galleryImages ?? []),
      basePrice: Number(basePrice),
      isActive: isActive ?? true,
      isAvailable: isAvailable ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      translations: {
        create: (translations as Array<{
          language: string;
          name: string;
          description?: string;
          ingredients?: string;
        }>).map((t) => ({
          language: t.language,
          name: t.name,
          description: t.description ?? null,
          ingredients: t.ingredients ?? null,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(item, { status: 201 });
}
