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
  const { type, value, startDate, endDate, weekdays, isActive } = body;

  const discount = await prisma.discount.update({
    where: { id },
    data: {
      ...(type !== undefined && { type }),
      ...(value !== undefined && { value: Number(value) }),
      ...(startDate !== undefined && {
        startDate: startDate ? new Date(startDate) : null,
      }),
      ...(endDate !== undefined && {
        endDate: endDate ? new Date(endDate) : null,
      }),
      ...(weekdays !== undefined && { weekdays: JSON.stringify(weekdays) }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      category: { include: { translations: true } },
      items: {
        include: {
          item: { include: { translations: true } },
        },
      },
    },
  });

  return NextResponse.json(discount);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  await prisma.discount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
