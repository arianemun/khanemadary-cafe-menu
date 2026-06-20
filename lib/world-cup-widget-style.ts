export type WorldCupWidgetBackgroundStyle =
  | "glass-black"
  | "glass-white"
  | "white";

export const WORLD_CUP_WIDGET_BACKGROUND_STYLES: WorldCupWidgetBackgroundStyle[] =
  ["glass-black", "glass-white", "white"];

export interface WorldCupWidgetTheme {
  card: string;
  headerBorder: string;
  title: string;
  badge: string;
  divider: string;
  teamLabel: string;
  score: string;
  scoreSep: string;
  countdown: string;
  status: string;
  meta: string;
  dot: string;
  empty: string;
  skeleton: string;
  live: string;
  liveDot: string;
}

const THEMES: Record<WorldCupWidgetBackgroundStyle, WorldCupWidgetTheme> = {
  "glass-white": {
    card: "rounded-xl border border-white/25 bg-white/15 backdrop-blur-xl",
    headerBorder: "border-white/20",
    title: "text-white",
    badge: "rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-white",
    divider: "divide-white/10",
    teamLabel: "text-white",
    score: "text-white",
    scoreSep: "text-white/50",
    countdown: "text-white",
    status: "text-white/75",
    meta: "text-white/60",
    dot: "text-white/40",
    empty: "text-white/75",
    skeleton: "bg-white/15",
    live: "text-emerald-200",
    liveDot: "bg-emerald-300",
  },
  "glass-black": {
    card: "rounded-xl border border-white/25 bg-black/35 backdrop-blur-xl",
    headerBorder: "border-white/20",
    title: "text-white",
    badge: "rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-white",
    divider: "divide-white/10",
    teamLabel: "text-white",
    score: "text-white",
    scoreSep: "text-white/50",
    countdown: "text-white",
    status: "text-white/75",
    meta: "text-white/60",
    dot: "text-white/40",
    empty: "text-white/75",
    skeleton: "bg-white/10",
    live: "text-emerald-200",
    liveDot: "bg-emerald-300",
  },
  white: {
    card: "rounded-xl border border-gray-200/90 bg-white/80 shadow-sm backdrop-blur-xl",
    headerBorder: "border-gray-200/80",
    title: "text-foreground",
    badge:
      "rounded-full border border-gray-300/80 bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700 shadow-sm",
    divider: "divide-gray-200/90",
    teamLabel: "text-foreground/80",
    score: "text-foreground",
    scoreSep: "text-foreground/40",
    countdown: "text-foreground",
    status: "text-foreground/60",
    meta: "text-foreground/50",
    dot: "text-foreground/30",
    empty: "text-foreground/60",
    skeleton: "bg-gray-200/70",
    live: "text-emerald-700",
    liveDot: "bg-emerald-500",
  },
};

export function normalizeWorldCupBackgroundStyle(
  value: unknown
): WorldCupWidgetBackgroundStyle {
  if (
    value === "glass-black" ||
    value === "glass-white" ||
    value === "white"
  ) {
    return value;
  }
  return "glass-white";
}

export function getWorldCupWidgetTheme(
  style: WorldCupWidgetBackgroundStyle
): WorldCupWidgetTheme {
  return THEMES[style];
}
