import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const discount = await prisma.discount.findUnique({ where: { id } });
  if (!discount) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.discount.update({
    where: { id },
    data: { isActive: !discount.isActive },
  });
  return NextResponse.json(updated);
}
