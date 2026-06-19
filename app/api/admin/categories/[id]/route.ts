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
  const { slug, icon, translations, sortOrder } = body;

  await prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: {
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
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
