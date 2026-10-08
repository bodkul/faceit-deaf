"use client";

import NumberFlow from "@number-flow/react";
import {
  IconArrowUpRight,
  IconCalendar,
  IconClock,
  IconServer,
} from "@tabler/icons-react";
import { cn } from "cn";
import { format, intervalToDuration } from "date-fns";
import { isNumber, meanBy } from "es-toolkit";
import { orderBy } from "es-toolkit/array";
import { sumBy } from "es-toolkit/compat";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";

import { FaceitLevelIcon } from "@/components/icons";
import { MapBackground } from "@/components/map-background";
import { SectionHeader } from "@/components/section-header";
import {
  diffTone,
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { StatusPill } from "@/components/status-pill";
import { TeamAvatar } from "@/components/team-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TwitchPlayer } from "@/features/match/components/twitch-player";
import { useLiveStreams } from "@/features/match/hooks/use-live-streams";
import { useMatch } from "@/features/match/hooks/use-match";
import { calculateAverageStats } from "@/features/match/lib/calculate-average-stats";
import { formatNumberWithSign } from "@/lib/format";

type MatchType = NonNullable<ReturnType<typeof useMatch>["data"]>;
type TeamType = MatchType["teams"][number];
type PlayerType = TeamType["team_players"][number];

const formatDuration = (start: string, end: string): string => {
  const { hours = 0, minutes = 0 } = intervalToDuration({ start, end });
  if (hours > 0 && minutes === 0) return `${hours}h`;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-56 rounded-2xl" />
      {[0, 1].map((t) => (
        <div
          key={t}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)"
        >
          <div className="flex items-center gap-3 border-border border-b px-4 py-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          {[0, 1, 2, 3, 4].map((r) => (
            <div
              key={r}
              className="flex items-center gap-3 border-border border-b px-4 py-3 last:border-0"
            >
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="ml-auto h-4 w-1/2" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MatchStatus({ match }: { match: MatchType }) {
  if (match.finished_at) return <StatusPill tone="muted">Finished</StatusPill>;
  if (match.started_at) {
    return (
      <StatusPill tone="live" pulse>
        Live
      </StatusPill>
    );
  }
  return <StatusPill tone="warning">Starting</StatusPill>;
}

function TeamSide({
  team,
  align,
}: {
  team: TeamType;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:gap-4",
        align === "left" ? "sm:text-left" : "sm:flex-row-reverse sm:text-right",
      )}
    >
      <TeamAvatar
        name={team.name}
        src={team.avatar}
        className="size-12 rounded-xl sm:size-16"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="w-full truncate font-bold text-sm sm:line-clamp-2 sm:whitespace-normal sm:break-all sm:text-lg">
          {team.name}
        </span>
        {team.team_win != null && (
          <span
            className={cn(
              "font-mono font-semibold text-[11px] uppercase tracking-wider",
              team.team_win ? "text-win" : "text-loss",
            )}
          >
            {team.team_win ? "Winner" : "Defeat"}
          </span>
        )}
      </div>
    </div>
  );
}

function Score({ team }: { team: TeamType }) {
  return (
    <NumberFlow
      value={Number(team.final_score ?? 0)}
      className={cn(
        team.team_win === true && "text-win",
        team.team_win === false && "text-foreground/60",
      )}
    />
  );
}

function HalfScores({ team1, team2 }: { team1: TeamType; team2: TeamType }) {
  const parts = [
    ["1st", team1.first_half_score, team2.first_half_score],
    ["2nd", team1.second_half_score, team2.second_half_score],
  ] as const;
  const hasOvertime = !!team1.overtime_score || !!team2.overtime_score;

  if (parts.every(([, a, b]) => a == null && b == null)) return null;

  return (
    <div className="flex items-center gap-3 font-mono text-muted-foreground text-xs tabular-nums">
      {parts.map(([label, a, b]) => (
        <span key={label}>
          <span className="text-faint">{label} </span>
          {a ?? "–"}:{b ?? "–"}
        </span>
      ))}
      {hasOvertime && (
        <span className="text-warning">
          <span className="opacity-70">OT </span>
          {team1.overtime_score ?? 0}:{team2.overtime_score ?? 0}
        </span>
      )}
    </div>
  );
}

function MatchHeader({ match }: { match: MatchType }) {
  const [team1, team2] = match.teams;

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
      <MapBackground map={match.map_pick} className="opacity-50" />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-border/60 border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-muted-foreground text-sm">
          <MatchStatus match={match} />
          <span className="font-semibold text-foreground capitalize">
            {match.map_pick?.replace("de_", "") ?? "Map vote"}
          </span>
          {match.started_at && (
            <span className="inline-flex items-center gap-1.5">
              <IconCalendar className="size-4 text-faint" />
              {format(match.started_at, "d MMM yyyy, HH:mm")}
            </span>
          )}
          {match.finished_at && match.started_at && (
            <span className="inline-flex items-center gap-1.5">
              <IconClock className="size-4 text-faint" />
              {formatDuration(match.started_at, match.finished_at)}
            </span>
          )}
          {match.location_pick && (
            <span className="inline-flex items-center gap-1.5">
              <IconServer className="size-4 text-faint" />
              {match.location_pick}
            </span>
          )}
        </div>
        <Link
          className={buttonVariants({ variant: "outline", size: "sm" })}
          href={`https://www.faceit.com/en/cs2/room/1-${match.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on FACEIT
          <IconArrowUpRight />
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        <TeamSide team={team1} align="left" />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 font-black font-mono text-4xl tabular-nums sm:gap-4 sm:text-6xl">
            <Score team={team1} />
            <span className="text-2xl text-faint sm:text-3xl">:</span>
            <Score team={team2} />
          </div>
          <HalfScores team1={team1} team2={team2} />
        </div>
        <TeamSide team={team2} align="right" />
      </div>
    </section>
  );
}

function playerStats(player: PlayerType, rounds: number) {
  const { kills, deaths, assists, adr, kr_ratio, headshots } = player;
  return {
    diff: isNumber(kills) && isNumber(deaths) ? kills - deaths : null,
    kd:
      isNumber(kills) && isNumber(deaths) && deaths > 0 ? kills / deaths : null,
    hs:
      isNumber(headshots) && isNumber(kills) && kills > 0
        ? (headshots / kills) * 100
        : null,
    rating:
      isNumber(assists) &&
      isNumber(deaths) &&
      isNumber(adr) &&
      isNumber(kr_ratio)
        ? calculateAverageStats({
            rounds,
            assists,
            deaths,
            adr,
            kpr: kr_ratio,
          }).rating
        : null,
  };
}

function TeamStatsTable({
  team,
  totalScore,
  isMatchFinished,
}: {
  team: TeamType;
  totalScore: number;
  isMatchFinished: boolean;
}) {
  const rows = useMemo(() => {
    const sorted = isMatchFinished
      ? orderBy(team.team_players, ["kills"], ["desc"])
      : orderBy(team.team_players, ["game_skill_level"], ["desc"]);
    return sorted.map((player) => ({
      player,
      ...playerStats(player, totalScore),
    }));
  }, [isMatchFinished, team.team_players, totalScore]);

  const has = (key: "kills" | "deaths" | "assists" | "adr" | "headshots") =>
    team.team_players.some((p) => p[key] != null);
  const total = (key: "kills" | "deaths" | "assists" | "headshots") =>
    has(key) ? sumBy(team.team_players, (p) => p[key] ?? 0) : null;

  const totals = {
    kills: total("kills"),
    deaths: total("deaths"),
    assists: total("assists"),
    headshots: total("headshots"),
    adr: has("adr")
      ? meanBy(
          team.team_players.filter((p) => p.adr != null),
          (p) => p.adr ?? 0,
        )
      : null,
    rating: rows.some((r) => r.rating != null)
      ? meanBy(rows, (r) => r.rating ?? 0)
      : null,
  };
  const totalDiff =
    totals.kills != null && totals.deaths != null
      ? totals.kills - totals.deaths
      : null;
  const totalKd =
    totals.kills != null && totals.deaths ? totals.kills / totals.deaths : null;
  const totalHs =
    totals.headshots != null && totals.kills
      ? (totals.headshots / totals.kills) * 100
      : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <div className="flex items-center gap-3 border-border border-b px-4 py-3">
        <TeamAvatar name={team.name} src={team.avatar} className="size-8" />
        <span className="min-w-0 truncate font-semibold">{team.name}</span>
        {team.team_win != null && (
          <span
            className={cn(
              "ml-auto shrink-0 rounded-md px-2 py-0.5 font-mono font-semibold text-xs",
              team.team_win ? "bg-win/15 text-win" : "bg-loss/15 text-loss",
            )}
          >
            {team.team_win ? "WIN" : "LOSS"}
          </span>
        )}
      </div>

      <StatsTable minWidth={600} fixed>
        <thead className="border-border border-b">
          <tr>
            <StatsTh sticky align="left" className="w-36 sm:w-60">
              Player
            </StatsTh>
            <StatsTh>K</StatsTh>
            <StatsTh>D</StatsTh>
            <StatsTh>A</StatsTh>
            <StatsTh>+/-</StatsTh>
            <StatsTh>K/D</StatsTh>
            <StatsTh>ADR</StatsTh>
            <StatsTh>HS%</StatsTh>
            <StatsTh>Rating</StatsTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ player, diff, kd, hs, rating }) => (
            <tr
              key={player.id}
              className="group transition-colors hover:bg-foreground/[0.03]"
            >
              <StatsTd sticky align="left" numeric={false}>
                <Link
                  href={`/player/${player.player_id_nullable ? player.nickname : player.player_id_mandatory}`}
                  className="flex items-center gap-2.5 font-medium transition-colors hover:text-primary"
                >
                  <FaceitLevelIcon
                    level={player.game_skill_level}
                    className="size-6 shrink-0"
                  />
                  <span className="truncate">{player.nickname}</span>
                </Link>
              </StatsTd>
              <StatsTd tone="strong">{player.kills}</StatsTd>
              <StatsTd>{player.deaths}</StatsTd>
              <StatsTd>{player.assists}</StatsTd>
              <StatsTd tone={diffTone(diff)}>
                {diff != null ? formatNumberWithSign(diff) : null}
              </StatsTd>
              <StatsTd tone={ratioTone(kd)}>{kd?.toFixed(2)}</StatsTd>
              <StatsTd>{player.adr?.toFixed(1)}</StatsTd>
              <StatsTd>{hs != null ? `${hs.toFixed(0)}%` : null}</StatsTd>
              <StatsTd tone={ratioTone(rating)} className="font-semibold">
                {rating?.toFixed(2)}
              </StatsTd>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-border border-t bg-foreground/[0.02]">
          <tr>
            <StatsTd
              sticky
              align="left"
              numeric={false}
              className="bg-[color-mix(in_oklch,var(--card),var(--muted)_20%)] font-mono text-[11px] text-faint uppercase tracking-wider"
            >
              Team
            </StatsTd>
            <StatsTd tone="muted">{totals.kills}</StatsTd>
            <StatsTd tone="muted">{totals.deaths}</StatsTd>
            <StatsTd tone="muted">{totals.assists}</StatsTd>
            <StatsTd tone={diffTone(totalDiff)}>
              {totalDiff != null ? formatNumberWithSign(totalDiff) : null}
            </StatsTd>
            <StatsTd tone="muted">{totalKd?.toFixed(2)}</StatsTd>
            <StatsTd tone="muted">{totals.adr?.toFixed(1)}</StatsTd>
            <StatsTd tone="muted">
              {totalHs != null ? `${totalHs.toFixed(0)}%` : null}
            </StatsTd>
            <StatsTd tone="muted">{totals.rating?.toFixed(2)}</StatsTd>
          </tr>
        </tfoot>
      </StatsTable>
    </div>
  );
}

export function MatchView({ matchId }: { matchId: string }) {
  const { data: match, isLoading } = useMatch(matchId.replace(/^1-/, ""));
  const { data: streamingPlayers = [] } = useLiveStreams();

  if (!matchId.startsWith("1-")) return notFound();
  if (isLoading) return <Loading />;
  if (!match || match.teams.length < 2) return notFound();

  const totalScore = sumBy(match.teams, (team) => team.final_score ?? 0);

  const matchPlayerIds = match.teams
    .flatMap((t) => t.team_players)
    .map((p) => p.player_id_nullable)
    .filter(Boolean);

  const activeStreams = streamingPlayers.filter(
    (s) => s.twitch_login && matchPlayerIds.includes(s.id),
  );

  return (
    <div className="flex flex-col gap-8">
      <MatchHeader match={match} />

      {activeStreams.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Live streams"
            description="Players from this match streaming on Twitch"
          />
          <div
            className={cn(
              "grid gap-4",
              activeStreams.length > 1 && "lg:grid-cols-2",
            )}
          >
            {activeStreams.map((s) => (
              <TwitchPlayer key={s.id} login={s.twitch_login as string} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Scoreboard"
          description={
            match.finished_at
              ? "Final player statistics"
              : "Statistics appear when the match ends"
          }
        />
        {match.teams.map((team) => (
          <TeamStatsTable
            key={team.id}
            team={team}
            totalScore={totalScore}
            isMatchFinished={Boolean(match.finished_at)}
          />
        ))}
      </section>
    </div>
  );
}
