import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const discounts = await prisma.discount.findMany({
    include: {
      item: {
        include: { translations: { where: { language: "fa" } } },
      },
    },
    orderBy: { id: "desc" },
  });

  return NextResponse.json(discounts);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { itemId, type, value, startDate, endDate, weekdays, isActive } = body;

  const discount = await prisma.discount.create({
    data: {
      itemId,
      type,
      value: Number(value),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      weekdays: JSON.stringify(weekdays ?? []),
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json(discount, { status: 201 });
}
