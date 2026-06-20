"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatCountdown,
  formatKickoffTime,
  type WorldCupMatch,
} from "@/lib/world-cup";
import { getTeamShortLabel } from "@/lib/world-cup-flags";
import { getWorldCupWidgetTheme } from "@/lib/world-cup-widget-style";
import type { WorldCupWidgetTheme } from "@/lib/world-cup-widget-style";
import { formatAdminDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { WorldCupSettings } from "@/lib/world-cup-settings";
import { WorldCupTeamFlag } from "./WorldCupTeamFlag";

interface WorldCupMatchesHeroProps {
  config: WorldCupSettings;
}

interface WorldCupApiResponse {
  enabled: boolean;
  matches: WorldCupMatch[];
  timezone?: string;
  titleFa?: string;
  titleEn?: string;
  error?: string;
}

function formatDisplayValue(value: string, locale: string) {
  return locale === "fa" ? formatAdminDigits(value, "fa") : value;
}

function MatchCountdown({
  kickoffIso,
  locale,
  theme,
}: {
  kickoffIso: string;
  locale: string;
  theme: WorldCupWidgetTheme;
}) {
  const [remainingMs, setRemainingMs] = useState(() => {
    const kickoff = new Date(kickoffIso).getTime();
    return Math.max(0, kickoff - Date.now());
  });

  useEffect(() => {
    const kickoff = new Date(kickoffIso).getTime();
    if (Number.isNaN(kickoff)) return;

    const tick = () => {
      setRemainingMs(Math.max(0, kickoff - Date.now()));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [kickoffIso]);

  return (
    <span
      className={cn(
        "text-[13px] font-bold tabular-nums leading-none tracking-tight",
        theme.countdown
      )}
    >
      {formatDisplayValue(formatCountdown(remainingMs), locale)}
    </span>
  );
}

function TeamColumn({
  teamName,
  theme,
}: {
  teamName: string;
  theme: WorldCupWidgetTheme;
}) {
  return (
    <div className="flex w-[3.5rem] shrink-0 flex-col items-center gap-1.5">
      <WorldCupTeamFlag teamName={teamName} size="sm" />
      <span
        className={cn(
          "max-w-full truncate text-center text-[9px] font-medium leading-none",
          theme.teamLabel
        )}
      >
        {getTeamShortLabel(teamName)}
      </span>
    </div>
  );
}

function getMatchMetaParts(
  match: WorldCupMatch,
  locale: string,
  halfTimeLabel: string
): string[] {
  const parts: string[] = [];

  if (match.group) parts.push(match.group);
  if (match.ground) parts.push(match.ground);

  if (
    match.status === "finished" &&
    match.htScore1 != null &&
    match.htScore2 != null
  ) {
    const ht = `${formatDisplayValue(String(match.htScore1), locale)}-${formatDisplayValue(String(match.htScore2), locale)}`;
    parts.push(`${halfTimeLabel} ${ht}`);
  }

  const round = match.round.trim();
  if (round && !/^matchday\s+\d+$/i.test(round)) {
    parts.push(round);
  }

  return parts;
}

function MatchCenter({
  match,
  locale,
  timezone,
  theme,
}: {
  match: WorldCupMatch;
  locale: string;
  timezone: string;
  theme: WorldCupWidgetTheme;
}) {
  const t = useTranslations("worldCup");
  const intlLocale = locale === "fa" ? "fa-IR" : "en-US";
  const kickoffLabel = formatKickoffTime(match.kickoffIso, timezone, intlLocale);
  const metaParts = getMatchMetaParts(match, locale, t("halfTime"));

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-3">
      {match.status === "finished" || match.status === "live" ? (
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-bold tabular-nums leading-none",
            theme.score
          )}
        >
          <span>{formatDisplayValue(String(match.score1 ?? 0), locale)}</span>
          <span className={cn("text-[11px] font-normal", theme.scoreSep)}>:</span>
          <span>{formatDisplayValue(String(match.score2 ?? 0), locale)}</span>
        </div>
      ) : (
        <MatchCountdown
          kickoffIso={match.kickoffIso}
          locale={locale}
          theme={theme}
        />
      )}

      <div
        className={cn(
          "flex max-w-full flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[9px] leading-none",
          theme.status
        )}
      >
        {match.status === "live" ? (
          <span className={cn("inline-flex items-center gap-0.5 font-semibold", theme.live)}>
            <span
              className={cn("h-1 w-1 animate-pulse rounded-full", theme.liveDot)}
            />
            {t("live")}
          </span>
        ) : null}
        {match.status === "finished" ? <span>{t("finished")}</span> : null}
        {match.status === "upcoming" ? <span>{t("startsIn")}</span> : null}
        {(match.status === "live" ||
          match.status === "finished" ||
          match.status === "upcoming") && (
          <>
            <span className={theme.dot}>·</span>
            <span>{formatDisplayValue(kickoffLabel, locale)}</span>
          </>
        )}
      </div>

      {metaParts.length > 0 ? (
        <p
          className={cn(
            "max-w-full truncate text-center text-[8px] leading-tight",
            theme.meta
          )}
        >
          {metaParts.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function MatchRow({
  match,
  locale,
  timezone,
  theme,
}: {
  match: WorldCupMatch;
  locale: string;
  timezone: string;
  theme: WorldCupWidgetTheme;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2 px-3 py-2">
      <TeamColumn teamName={match.team1} theme={theme} />
      <MatchCenter
        match={match}
        locale={locale}
        timezone={timezone}
        theme={theme}
      />
      <TeamColumn teamName={match.team2} theme={theme} />
    </div>
  );
}

export function WorldCupMatchesHero({ config }: WorldCupMatchesHeroProps) {
  const locale = useLocale();
  const t = useTranslations("worldCup");
  const [matches, setMatches] = useState<WorldCupMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const theme = getWorldCupWidgetTheme(config.backgroundStyle);

  const title = locale === "fa" ? config.titleFa : config.titleEn;

  const loadMatches = useCallback(async () => {
    try {
      const response = await fetch("/api/world-cup/today", {
        cache: "no-store",
      });
      if (!response.ok) return;

      const payload = (await response.json()) as WorldCupApiResponse;
      if (!payload.enabled) {
        setVisible(false);
        setMatches([]);
        return;
      }

      setVisible(true);
      setMatches(payload.matches ?? []);
    } catch {
      setVisible(false);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!config.enabled) {
      setVisible(false);
      setLoading(false);
      return;
    }

    void loadMatches();
    const intervalId = window.setInterval(() => {
      void loadMatches();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [config.enabled, loadMatches]);

  if (!config.enabled) return null;
  if (!visible && !loading) return null;

  return (
    <div className="w-full">
      <div
        className={cn(
          "overflow-hidden",
          theme.card,
          loading && "animate-pulse"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-2 border-b px-4 py-2.5",
            theme.headerBorder
          )}
        >
          <div className={cn("flex min-w-0 items-center gap-1", theme.title)}>
            <Trophy className="h-3 w-3 shrink-0 text-amber-500" aria-hidden />
            <p className="truncate text-[11px] font-semibold leading-none">
              {title}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 text-[9px] leading-none",
              theme.badge
            )}
          >
            {t("todayMatches")}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-3 py-3">
            <div className={cn("h-7 w-7 rounded-full", theme.skeleton)} />
            <div className={cn("h-4 w-10 rounded", theme.skeleton)} />
            <div className={cn("h-7 w-7 rounded-full", theme.skeleton)} />
          </div>
        ) : matches.length > 0 ? (
          <div className={cn("divide-y px-1 py-0.5", theme.divider)}>
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                locale={locale}
                timezone={config.timezone}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <p className={cn("px-3 py-2.5 text-center text-[10px]", theme.empty)}>
            {t("noMatches")}
          </p>
        )}
      </div>
    </div>
  );
}
