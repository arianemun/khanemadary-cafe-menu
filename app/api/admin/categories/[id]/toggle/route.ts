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
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.category.update({
    where: { id },
    data: { isActive: !cat.isActive },
  });
  return NextResponse.json(updated);
}
