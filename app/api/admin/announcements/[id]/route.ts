import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

type TranslationInput = {
  language: string;
  title?: string | null;
  message?: string | null;
};

function mapTranslations(translations: TranslationInput[] | undefined) {
  return (translations ?? []).map((row) => ({
    language: row.language,
    title: row.title?.trim() ? row.title.trim() : null,
    message: row.message?.trim() ? row.message.trim() : null,
  }));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { translations, ...rest } = body;

  await prisma.$transaction(async (tx) => {
    await tx.announcement.update({
      where: { id: params.id },
      data: {
        link: rest.link ?? null,
        durationSeconds: rest.durationSeconds ?? 10,
        maxDisplayCount: rest.maxDisplayCount ?? 1,
        isActive: rest.isActive,
      },
    });

    if (translations) {
      for (const row of mapTranslations(translations)) {
        await tx.announcementTranslation.upsert({
          where: {
            announcementId_language: {
              announcementId: params.id,
              language: row.language,
            },
          },
          update: {
            title: row.title,
            message: row.message,
          },
          create: {
            announcementId: params.id,
            language: row.language,
            title: row.title,
            message: row.message,
          },
        });
      }
    }
  });

  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  await prisma.announcement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
