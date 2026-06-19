import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const categories = await prisma.category.findMany({
    include: { translations: true, _count: { select: { items: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { slug, icon, translations } = body;

  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.category.create({
    data: {
      slug,
      icon: icon ?? null,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      translations: {
        create: (translations as Array<{ language: string; name: string }>).map(
          (t) => ({ language: t.language, name: t.name })
        ),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(category, { status: 201 });
}
