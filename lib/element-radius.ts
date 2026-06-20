export const DEFAULT_ELEMENT_BORDER_RADIUS = 16;
export const MIN_ELEMENT_BORDER_RADIUS = 0;
export const MAX_ELEMENT_BORDER_RADIUS = 16;

export function resolveElementBorderRadius(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), MIN_ELEMENT_BORDER_RADIUS, MAX_ELEMENT_BORDER_RADIUS);
  }
  if (typeof raw === "string" && raw !== "") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      return clamp(parsed, MIN_ELEMENT_BORDER_RADIUS, MAX_ELEMENT_BORDER_RADIUS);
    }
  }
  return DEFAULT_ELEMENT_BORDER_RADIUS;
}

export function elementBorderRadiusToCssVars(radius: number): Record<string, string> {
  const card = `${radius}px`;
  const btn = `${Math.round(radius * 0.5)}px`;
  const sheet = `${Math.round(radius * 1.5)}px`;

  return {
    "--radius-card": card,
    "--radius-btn": btn,
    "--radius-sheet": sheet,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
