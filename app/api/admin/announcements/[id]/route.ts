import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const announcement = await prisma.announcement.update({
    where: { id: params.id },
    data: {
      titleFa: body.titleFa ?? null,
      titleEn: body.titleEn ?? null,
      messageFa: body.messageFa ?? null,
      messageEn: body.messageEn ?? null,
      color: body.color ?? "#3F51B5",
      link: body.link ?? null,
      durationSeconds: body.durationSeconds ?? 10,
      maxDisplayCount: body.maxDisplayCount ?? 1,
      isActive: body.isActive,
    },
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
