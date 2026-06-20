import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { categoryId, orderedIds } = await request.json();
  if (categoryId !== null && typeof categoryId !== "string") {
    return NextResponse.json({ error: "categoryId required" }, { status: 400 });
  }
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
  }

  const items = await prisma.menuItem.findMany({
    where: { id: { in: orderedIds } },
    select: { id: true, categoryId: true },
  });

  if (items.length !== orderedIds.length) {
    return NextResponse.json({ error: "invalid item ids" }, { status: 400 });
  }

  const allSameCategory = items.every(
    (item) => (item.categoryId ?? null) === (categoryId ?? null)
  );
  if (!allSameCategory) {
    return NextResponse.json(
      { error: "all items must belong to the same category" },
      { status: 400 }
    );
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
