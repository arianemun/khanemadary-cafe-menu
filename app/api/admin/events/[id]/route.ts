import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { normalizeEventMedia } from "@/lib/event-media";
import { resolveEventOverlayOpacity } from "@/lib/event-overlay";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function buildEventUpdateData(body: Record<string, unknown>): Prisma.EventUpdateInput {
  const data: Prisma.EventUpdateInput = {};

  if ("image" in body || "video" in body) {
    const media = normalizeEventMedia(
      "image" in body ? (body.image as string | null) : undefined,
      "video" in body ? (body.video as string | null) : undefined
    );
    data.image = media.image;
    data.video = media.video;
  }
  if ("title" in body) data.title = (body.title as string | null) ?? null;
  if ("description" in body) {
    data.description = (body.description as string | null) ?? null;
  }
  if ("startDate" in body) {
    data.startDate = body.startDate ? new Date(body.startDate as string) : null;
  }
  if ("endDate" in body) {
    data.endDate = body.endDate ? new Date(body.endDate as string) : null;
  }
  if ("overlayOpacity" in body) {
    data.overlayOpacity = resolveEventOverlayOpacity(body.overlayOpacity);
  }
  if ("isActive" in body) data.isActive = Boolean(body.isActive);

  return data;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const data = buildEventUpdateData(body);

  const event = await prisma.event.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
