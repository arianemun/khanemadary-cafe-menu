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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const announcements = await prisma.announcement.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true },
  });
  return NextResponse.json(announcements);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const maxOrder = await prisma.announcement.aggregate({
    _max: { sortOrder: true },
  });

  const announcement = await prisma.announcement.create({
    data: {
      link: body.link ?? null,
      durationSeconds: body.durationSeconds ?? 10,
      maxDisplayCount: body.maxDisplayCount ?? 1,
      isActive: body.isActive ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      translations: {
        create: mapTranslations(body.translations),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(announcement);
}
