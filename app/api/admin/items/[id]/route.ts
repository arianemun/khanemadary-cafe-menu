import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
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

  await prisma.$transaction(async (tx) => {
    await tx.menuItem.update({
      where: { id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(mainImage !== undefined && { mainImage }),
        ...(galleryImages !== undefined && {
          galleryImages: JSON.stringify(galleryImages),
        }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(isActive !== undefined && { isActive }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    if (translations) {
      for (const t of translations as Array<{
        language: string;
        name: string;
        description?: string;
        ingredients?: string;
      }>) {
        await tx.itemTranslation.upsert({
          where: { itemId_language: { itemId: id, language: t.language } },
          update: {
            name: t.name,
            description: t.description ?? null,
            ingredients: t.ingredients ?? null,
          },
          create: {
            itemId: id,
            language: t.language,
            name: t.name,
            description: t.description ?? null,
            ingredients: t.ingredients ?? null,
          },
        });
      }
    }
  });

  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: { translations: true },
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
