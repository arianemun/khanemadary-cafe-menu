/** Matches Tailwind `bg-black/35` (35% black overlay). */
export const DEFAULT_HERO_OVERLAY_OPACITY = 35;
export const MIN_HERO_OVERLAY_OPACITY = 0;
export const MAX_HERO_OVERLAY_OPACITY = 100;

export function resolveHeroOverlayOpacity(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), MIN_HERO_OVERLAY_OPACITY, MAX_HERO_OVERLAY_OPACITY);
  }
  if (typeof raw === "string" && raw !== "") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      return clamp(parsed, MIN_HERO_OVERLAY_OPACITY, MAX_HERO_OVERLAY_OPACITY);
    }
  }
  return DEFAULT_HERO_OVERLAY_OPACITY;
}

export function heroOverlayOpacityToRgba(percent: number): string {
  const alpha = resolveHeroOverlayOpacity(percent) / 100;
  return `rgba(0, 0, 0, ${alpha})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
