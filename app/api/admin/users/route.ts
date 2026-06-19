import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const users = await prisma.adminUser.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if ("error" in auth) return auth.error;

  const { email, password, name, role } = await request.json();
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.adminUser.create({
    data: { email, password: hash, name, role: role ?? "editor" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
