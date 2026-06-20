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
  const { slug, icon, translations, sortOrder, isActive, itemDisplayMode, itemDisplayOddBackground } =
    body;

  if (translations) {
    const missing = validateTranslationNames(translations);
    if (missing.length) {
      return NextResponse.json({ error: "validation", missing }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(itemDisplayMode !== undefined && { itemDisplayMode }),
        ...(itemDisplayOddBackground !== undefined && { itemDisplayOddBackground }),
      },
    });

    if (translations) {
      for (const t of translations as Array<{ language: string; name: string }>) {
        await tx.categoryTranslation.upsert({
          where: {
            categoryId_language: { categoryId: id, language: t.language },
          },
          update: { name: t.name },
          create: { categoryId: id, language: t.language, name: t.name },
        });
      }
    }
  });

  const category = await prisma.category.findUnique({
    where: { id },
    include: { translations: true },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
