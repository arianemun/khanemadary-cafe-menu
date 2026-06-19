import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { orderedIds } = await request.json();
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.category.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
