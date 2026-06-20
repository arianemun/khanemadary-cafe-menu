import { NextResponse } from "next/server";
import { normalizeEventMedia } from "@/lib/event-media";
import { resolveEventOverlayOpacity } from "@/lib/event-overlay";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const events = await prisma.event.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const maxOrder = await prisma.event.aggregate({ _max: { sortOrder: true } });
  const media = normalizeEventMedia(body.image, body.video);

  const event = await prisma.event.create({
    data: {
      image: media.image,
      video: media.video,
      title: body.title ?? null,
      description: body.description ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      overlayOpacity: resolveEventOverlayOpacity(body.overlayOpacity),
      isActive: body.isActive ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json(event);
}
