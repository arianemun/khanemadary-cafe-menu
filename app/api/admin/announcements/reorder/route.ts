import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as { orderedIds?: string[]; ids?: string[] };
  const orderedIds = body.orderedIds ?? body.ids;
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds required" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.announcement.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
