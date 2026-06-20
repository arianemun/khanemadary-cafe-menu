import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import type { DiscountScope } from "@/lib/discount";

function parseScope(value: unknown): DiscountScope | null {
  if (value === "item" || value === "items" || value === "category") {
    return value;
  }
  return null;
}

function validateTarget(scope: DiscountScope, categoryId?: string, itemIds?: string[]) {
  if (scope === "category") {
    return !!categoryId;
  }
  if (scope === "item") {
    return Array.isArray(itemIds) && itemIds.length === 1;
  }
  return Array.isArray(itemIds) && itemIds.length > 0;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const discounts = await prisma.discount.findMany({
    include: {
      category: { include: { translations: true } },
      items: {
        include: {
          item: { include: { translations: true } },
        },
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
  const scope = parseScope(body.scope) ?? "item";
  const itemIds: string[] = Array.isArray(body.itemIds)
    ? body.itemIds.filter((id: unknown): id is string => typeof id === "string")
    : [];
  const categoryId =
    typeof body.categoryId === "string" ? body.categoryId : undefined;

  if (!validateTarget(scope, categoryId, itemIds)) {
    return NextResponse.json({ error: "invalid_target" }, { status: 400 });
  }

  const { type, value, startDate, endDate, weekdays, isActive } = body;

  const discount = await prisma.discount.create({
    data: {
      scope,
      categoryId: scope === "category" ? categoryId : null,
      type,
      value: Number(value),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      weekdays: JSON.stringify(weekdays ?? []),
      isActive: isActive ?? true,
      ...(scope !== "category"
        ? {
            items: {
              create: itemIds.map((itemId) => ({ itemId })),
            },
          }
        : {}),
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

  return NextResponse.json(discount, { status: 201 });
}
