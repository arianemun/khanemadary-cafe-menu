export type MenuMaxWidthPreset = "sm" | "md" | "lg" | "web" | "full";

export const MENU_MAX_WIDTH_VALUES: Record<MenuMaxWidthPreset, string> = {
  sm: "480px",
  md: "600px",
  lg: "768px",
  web: "960px",
  full: "100%",
};

export const DEFAULT_MENU_MAX_WIDTH: MenuMaxWidthPreset = "web";

export const MENU_MAX_WIDTH_PRESETS: MenuMaxWidthPreset[] = [
  "sm",
  "md",
  "lg",
  "web",
  "full",
];

export function resolveMenuMaxWidth(raw: string | undefined): MenuMaxWidthPreset {
  if (raw && raw in MENU_MAX_WIDTH_VALUES) {
    return raw as MenuMaxWidthPreset;
  }
  return DEFAULT_MENU_MAX_WIDTH;
}

export function menuMaxWidthToCss(preset: MenuMaxWidthPreset): string {
  return MENU_MAX_WIDTH_VALUES[preset];
}
