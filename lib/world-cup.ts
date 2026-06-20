import { unstable_cache } from "next/cache";
import {
  DEFAULT_WORLD_CUP_DATA_URL,
  DEFAULT_WORLD_CUP_TIMEZONE,
  type WorldCupSettings,
} from "./world-cup-settings";

export type WorldCupMatchStatus = "finished" | "live" | "upcoming";

export interface WorldCupMatch {
  id: string;
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group: string | null;
  ground: string | null;
  status: WorldCupMatchStatus;
  kickoffIso: string;
  score1: number | null;
  score2: number | null;
  htScore1: number | null;
  htScore2: number | null;
}

interface OpenFootballGoal {
  name: string;
  minute: string;
}

interface OpenFootballMatch {
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group?: string;
  ground?: string;
  score?: {
    ft?: [number, number];
    ht?: [number, number];
  };
  goals1?: OpenFootballGoal[];
  goals2?: OpenFootballGoal[];
}

interface OpenFootballPayload {
  name?: string;
  matches?: OpenFootballMatch[];
}

const MATCH_DURATION_MS = 105 * 60 * 1000;

function formatUtcOffset(offset: string): string {
  const sign = offset.startsWith("-") ? "-" : "+";
  const hours = Math.abs(parseInt(offset, 10));
  return `${sign}${String(hours).padStart(2, "0")}:00`;
}

export function parseKickoffIso(date: string, time: string): string | null {
  const match = time.match(/^(\d{1,2}):(\d{2})\s+UTC([+-]\d+(?::\d{2})?)$/i);
  if (!match) return null;

  const [, hour, minute, offsetRaw] = match;
  const offset = offsetRaw.includes(":")
    ? offsetRaw
    : formatUtcOffset(offsetRaw);

  return `${date}T${hour.padStart(2, "0")}:${minute}:00${offset}`;
}

export function getDateInTimezone(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function resolveMatchStatus(
  kickoffIso: string,
  hasFinalScore: boolean,
  now = new Date()
): WorldCupMatchStatus {
  if (hasFinalScore) return "finished";

  const kickoff = new Date(kickoffIso).getTime();
  if (Number.isNaN(kickoff)) return "upcoming";

  const nowMs = now.getTime();
  if (nowMs < kickoff) return "upcoming";
  if (nowMs < kickoff + MATCH_DURATION_MS) return "live";
  return "finished";
}

function buildMatchId(match: OpenFootballMatch, index: number): string {
  return `${match.date}-${match.team1}-${match.team2}-${index}`;
}

function normalizeOpenFootballMatch(
  match: OpenFootballMatch,
  index: number,
  now = new Date()
): WorldCupMatch | null {
  const kickoffIso = parseKickoffIso(match.date, match.time);
  if (!kickoffIso) return null;

  const ft = match.score?.ft;
  const ht = match.score?.ht;
  const hasFinalScore = Array.isArray(ft) && ft.length === 2;
  const status = resolveMatchStatus(kickoffIso, hasFinalScore, now);

  return {
    id: buildMatchId(match, index),
    round: match.round,
    date: match.date,
    time: match.time,
    team1: match.team1,
    team2: match.team2,
    group: match.group ?? null,
    ground: match.ground ?? null,
    status,
    kickoffIso,
    score1: hasFinalScore ? ft[0] : null,
    score2: hasFinalScore ? ft[1] : null,
    htScore1: Array.isArray(ht) && ht.length === 2 ? ht[0] : null,
    htScore2: Array.isArray(ht) && ht.length === 2 ? ht[1] : null,
  };
}

async function fetchOpenFootballMatches(dataUrl: string): Promise<OpenFootballMatch[]> {
  const response = await fetch(dataUrl, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`World Cup data fetch failed: ${response.status}`);
  }

  const payload = (await response.json()) as OpenFootballPayload;
  return Array.isArray(payload.matches) ? payload.matches : [];
}

export async function getWorldCupMatches(
  dataUrl = DEFAULT_WORLD_CUP_DATA_URL
): Promise<WorldCupMatch[]> {
  const cached = unstable_cache(
    async () => fetchOpenFootballMatches(dataUrl),
    ["world-cup-matches", dataUrl],
    { revalidate: 60 }
  );

  const rawMatches = await cached();
  const now = new Date();

  return rawMatches
    .map((match, index) => normalizeOpenFootballMatch(match, index, now))
    .filter((match): match is WorldCupMatch => match !== null);
}

export async function getTodayWorldCupMatches(
  settings: Pick<WorldCupSettings, "dataUrl" | "timezone" | "maxMatches">,
  now = new Date()
): Promise<WorldCupMatch[]> {
  const timezone = settings.timezone || DEFAULT_WORLD_CUP_TIMEZONE;
  const today = getDateInTimezone(timezone, now);
  const matches = await getWorldCupMatches(settings.dataUrl);

  return matches
    .filter((match) => match.date === today)
    .sort(
      (a, b) =>
        new Date(a.kickoffIso).getTime() - new Date(b.kickoffIso).getTime()
    )
    .slice(0, settings.maxMatches);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function formatKickoffTime(
  kickoffIso: string,
  timezone: string,
  locale: string
): string {
  const date = new Date(kickoffIso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
