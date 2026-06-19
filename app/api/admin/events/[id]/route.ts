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
  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      image: body.image ?? null,
      title: body.title ?? null,
      description: body.description ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
