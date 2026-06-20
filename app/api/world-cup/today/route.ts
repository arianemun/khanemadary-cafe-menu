import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import { getTodayWorldCupMatches } from "@/lib/world-cup";
import { normalizeWorldCupSettings } from "@/lib/world-cup-settings";

export const revalidate = 60;

export async function GET() {
  const raw = await getSettings("worldCup");
  const config = normalizeWorldCupSettings(raw);

  if (!config.enabled) {
    return NextResponse.json({ enabled: false, matches: [] });
  }

  try {
    const matches = await getTodayWorldCupMatches(config);
    return NextResponse.json({
      enabled: true,
      matches,
      timezone: config.timezone,
      titleFa: config.titleFa,
      titleEn: config.titleEn,
    });
  } catch (error) {
    console.error("World Cup matches fetch failed:", error);
    return NextResponse.json(
      { enabled: true, matches: [], error: "fetch_failed" },
      { status: 502 }
    );
  }
}
