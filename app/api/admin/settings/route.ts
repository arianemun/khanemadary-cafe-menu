import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllSettings } from "@/lib/data";
import { localeConfigFromSettings } from "@/lib/locale-config";
import { writeLocaleRuntimeConfig } from "@/lib/locale-config.server";

async function syncLocaleRuntimeConfig(settings: Record<string, unknown>) {
  if (!("languages" in settings)) return;
  const languages = settings.languages as
    | { enabled?: string[]; default?: string }
    | undefined;
  writeLocaleRuntimeConfig(localeConfigFromSettings(languages));
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }

  const settings = await getAllSettings();
  await syncLocaleRuntimeConfig(settings);

  revalidatePath("/", "layout");

  return NextResponse.json(settings);
}
