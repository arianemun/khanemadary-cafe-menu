export type CategoryItemDisplayMode = "center" | "line" | "mixed" | "line-zigzag";

export type ResolvedItemLayout = "center" | "line-right" | "line-left";

export const DEFAULT_CATEGORY_ITEM_DISPLAY_MODE: CategoryItemDisplayMode = "center";

export const CATEGORY_ITEM_DISPLAY_MODES: CategoryItemDisplayMode[] = [
  "center",
  "line",
  "mixed",
  "line-zigzag",
];

export function parseCategoryItemDisplayMode(raw: unknown): CategoryItemDisplayMode {
  if (
    raw === "center" ||
    raw === "line" ||
    raw === "mixed" ||
    raw === "line-zigzag"
  ) {
    return raw;
  }
  return DEFAULT_CATEGORY_ITEM_DISPLAY_MODE;
}

export function resolveItemLayout(
  mode: CategoryItemDisplayMode,
  index: number
): ResolvedItemLayout {
  switch (mode) {
    case "center":
      return "center";
    case "line":
      return "line-right";
    case "mixed":
      return index % 2 === 0 ? "center" : "line-right";
    case "line-zigzag":
      return index % 2 === 0 ? "line-right" : "line-left";
    default:
      return "center";
  }
}

export function resolveOddBackground(
  enabled: boolean,
  index: number
): boolean {
  return enabled && index % 2 === 0;
}
