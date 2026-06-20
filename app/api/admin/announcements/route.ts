import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const announcements = await prisma.announcement.findMany({
    orderBy: { sortOrder: "asc" },
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
      titleFa: body.titleFa ?? null,
      titleEn: body.titleEn ?? null,
      messageFa: body.messageFa ?? null,
      messageEn: body.messageEn ?? null,
      color: body.color ?? "#3F51B5",
      link: body.link ?? null,
      durationSeconds: body.durationSeconds ?? 10,
      maxDisplayCount: body.maxDisplayCount ?? 1,
      isActive: body.isActive ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(announcement);
}
