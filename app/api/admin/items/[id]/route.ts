import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { validateTranslationNames } from "@/lib/admin-validation";

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
    secondaryPriceEnabled,
    secondaryPrice,
    preparationMinutes,
    isActive,
    isAvailable,
    translations,
  } = body;

  if (translations) {
    const missing = validateTranslationNames(translations);
    if (missing.length) {
      return NextResponse.json({ error: "validation", missing }, { status: 400 });
    }
  }

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
        ...(secondaryPriceEnabled !== undefined && {
          secondaryPriceEnabled: Boolean(secondaryPriceEnabled),
          secondaryPrice:
            secondaryPriceEnabled && secondaryPrice != null && secondaryPrice !== ""
              ? Number(secondaryPrice)
              : null,
        }),
        ...(preparationMinutes !== undefined && {
          preparationMinutes:
            preparationMinutes != null && preparationMinutes !== ""
              ? Number(preparationMinutes)
              : null,
        }),
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
        primaryPriceLabel?: string;
        secondaryPriceLabel?: string;
      }>) {
        await tx.itemTranslation.upsert({
          where: { itemId_language: { itemId: id, language: t.language } },
          update: {
            name: t.name,
            description: t.description ?? null,
            ingredients: t.ingredients ?? null,
            primaryPriceLabel: t.primaryPriceLabel?.trim() ? t.primaryPriceLabel.trim() : null,
            secondaryPriceLabel: t.secondaryPriceLabel?.trim()
              ? t.secondaryPriceLabel.trim()
              : null,
          },
          create: {
            itemId: id,
            language: t.language,
            name: t.name,
            description: t.description ?? null,
            ingredients: t.ingredients ?? null,
            primaryPriceLabel: t.primaryPriceLabel?.trim() ? t.primaryPriceLabel.trim() : null,
            secondaryPriceLabel: t.secondaryPriceLabel?.trim()
              ? t.secondaryPriceLabel.trim()
              : null,
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
