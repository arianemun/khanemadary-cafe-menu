export const DEFAULT_EVENT_OVERLAY_OPACITY = 50;
export const MIN_EVENT_OVERLAY_OPACITY = 0;
export const MAX_EVENT_OVERLAY_OPACITY = 100;

export function resolveEventOverlayOpacity(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), MIN_EVENT_OVERLAY_OPACITY, MAX_EVENT_OVERLAY_OPACITY);
  }
  if (typeof raw === "string" && raw !== "") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      return clamp(parsed, MIN_EVENT_OVERLAY_OPACITY, MAX_EVENT_OVERLAY_OPACITY);
    }
  }
  return DEFAULT_EVENT_OVERLAY_OPACITY;
}

export function eventOverlayGradient(percent: number): string {
  const strength = resolveEventOverlayOpacity(percent) / 100;
  const bottom = 0.55 + strength * 0.35;
  const mid = 0.18 + strength * 0.22;
  const top = strength * 0.08;
  return `linear-gradient(to top, rgba(0,0,0,${bottom}) 0%, rgba(0,0,0,${mid}) 48%, rgba(0,0,0,${top}) 100%)`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
