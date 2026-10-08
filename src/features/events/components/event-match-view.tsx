"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { cn } from "cn";
import { format } from "date-fns";
import { flatMap, groupBy, orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";

import { MapBackground } from "@/components/map-background";
import {
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { TeamAvatar } from "@/components/team-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type EventMatch,
  useEventData,
} from "@/features/events/hooks/use-event-data";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";

type MapData = EventMatch["maps"][number];
type TeamData = EventMatch["teams"][number];
type PlayerData = MapData["player_stats"][number];

const teamName = (team: TeamData | undefined) =>
  team ? normalizeTeamName(team.team_name) : "—";

function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-44 rounded-2xl" />
      <Skeleton className="h-10 w-80 max-w-full rounded-lg" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function SeriesHeader({ match, slug }: { match: EventMatch; slug: string }) {
  const [team1, team2] = match.teams;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-border border-b px-4 py-3 text-sm sm:px-6">
        <Link
          href={`/events/${slug}/matches`}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          All matches
        </Link>
        <span className="font-mono text-muted-foreground text-xs">
          Bo{match.best_of ?? match.maps.length}
          {match.started_at &&
            ` · ${format(match.started_at, "EEE d MMM, HH:mm")}`}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
        {[team1, team2].map((team, index) => (
          <div
            key={team?.id ?? index}
            className={cn(
              "flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:gap-4",
              index === 0
                ? "sm:text-left"
                : "order-last sm:flex-row-reverse sm:text-right",
            )}
          >
            <TeamAvatar
              name={teamName(team)}
              className="size-12 rounded-xl sm:size-14"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="w-full truncate font-bold text-sm sm:text-lg">
                {teamName(team)}
              </span>
              {team?.is_winner != null && (
                <span
                  className={cn(
                    "font-mono font-semibold text-[11px] uppercase tracking-wider",
                    team.is_winner ? "text-win" : "text-loss",
                  )}
                >
                  {team.is_winner ? "Winner" : "Defeat"}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="order-2 flex items-center gap-3 font-black font-mono text-4xl tabular-nums sm:text-5xl">
          <span
            className={cn(team1?.is_winner ? "text-win" : "text-foreground/60")}
          >
            {match.score_faction1 ?? "–"}
          </span>
          <span className="text-2xl text-faint">:</span>
          <span
            className={cn(team2?.is_winner ? "text-win" : "text-foreground/60")}
          >
            {match.score_faction2 ?? "–"}
          </span>
        </div>
      </div>
    </section>
  );
}

function MapScoreStrip({ map, teams }: { map: MapData; teams: TeamData[] }) {
  const stats = teams.map((team) =>
    map.team_stats.find((ts) => ts.faction_id === team.faction_id),
  );
  const [s1, s2] = stats;
  const halves = [
    ["1st", s1?.first_half_score, s2?.first_half_score],
    ["2nd", s1?.second_half_score, s2?.second_half_score],
  ] as const;
  const hasOvertime = !!s1?.overtime_score || !!s2?.overtime_score;

  return (
    <div className="relative isolate flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-xl border border-border bg-card px-4 py-3 shadow-(--highlight)">
      <MapBackground map={map.map_name} className="opacity-45" />
      <div className="flex items-center gap-3">
        <span className="font-bold capitalize">
          {map.map_name?.replace("de_", "")}
        </span>
        {map.total_rounds != null && (
          <span className="text-muted-foreground text-xs">
            {map.total_rounds} rounds
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 font-mono text-xs tabular-nums">
        {halves.map(([label, a, b]) =>
          a == null && b == null ? null : (
            <span key={label} className="text-muted-foreground">
              <span className="text-faint">{label} </span>
              {a ?? "–"}:{b ?? "–"}
            </span>
          ),
        )}
        {hasOvertime && (
          <span className="text-warning">
            OT {s1?.overtime_score ?? 0}:{s2?.overtime_score ?? 0}
          </span>
        )}
        <span className="font-black text-lg">
          <span
            className={cn(s1?.is_winner ? "text-win" : "text-foreground/70")}
          >
            {s1?.final_score ?? "–"}
          </span>
          <span className="text-faint"> : </span>
          <span
            className={cn(s2?.is_winner ? "text-win" : "text-foreground/70")}
          >
            {s2?.final_score ?? "–"}
          </span>
        </span>
      </div>
    </div>
  );
}

function PlayerTable({
  players,
  team,
  isWinner,
  eventSlug,
}: {
  players: PlayerData[];
  team: TeamData | undefined;
  isWinner?: boolean | null;
  eventSlug: string;
}) {
  const name = teamName(team);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <div className="flex items-center gap-3 border-border border-b px-4 py-3">
        <TeamAvatar name={name} className="size-8" />
        <span className="min-w-0 truncate font-semibold">{name}</span>
        {isWinner != null && (
          <span
            className={cn(
              "ml-auto shrink-0 rounded-md px-2 py-0.5 font-mono font-semibold text-xs",
              isWinner ? "bg-win/15 text-win" : "bg-loss/15 text-loss",
            )}
          >
            {isWinner ? "WIN" : "LOSS"}
          </span>
        )}
      </div>

      <StatsTable minWidth={560} fixed>
        <thead className="border-border border-b">
          <tr>
            <StatsTh sticky align="left" className="w-44 sm:w-60">
              Player
            </StatsTh>
            <StatsTh>K</StatsTh>
            <StatsTh>D</StatsTh>
            <StatsTh>A</StatsTh>
            <StatsTh>K/D</StatsTh>
            <StatsTh>ADR</StatsTh>
            <StatsTh>HS%</StatsTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {players.map((p) => {
            const k = p.kills ?? 0;
            const d = p.deaths ?? 0;
            const kd = k / Math.max(d, 1);
            const hs = ((p.headshots ?? 0) / Math.max(k, 1)) * 100;
            return (
              <tr
                key={p.id}
                className="transition-colors hover:bg-foreground/[0.03]"
              >
                <StatsTd sticky align="left" numeric={false}>
                  <Link
                    href={`/events/${eventSlug}/players/${encodeURIComponent(p.player_id)}`}
                    className="block max-w-40 truncate font-medium transition-colors hover:text-primary"
                  >
                    {p.nickname}
                  </Link>
                </StatsTd>
                <StatsTd tone="strong">{k}</StatsTd>
                <StatsTd>{d}</StatsTd>
                <StatsTd>{p.assists}</StatsTd>
                <StatsTd tone={ratioTone(kd)}>{kd.toFixed(2)}</StatsTd>
                <StatsTd>{p.adr?.toFixed(1)}</StatsTd>
                <StatsTd>{hs.toFixed(0)}%</StatsTd>
              </tr>
            );
          })}
        </tbody>
      </StatsTable>
    </div>
  );
}

/** Per-player totals across all maps of the series. */
function aggregatePlayers(maps: MapData[], factionId?: string | null) {
  const allStats = flatMap(maps, (map) =>
    map.player_stats.filter((p) => p && p.faction_id === factionId),
  );
  const grouped = groupBy(allStats, (p) => p.player_id);
  const aggregated = Object.values(grouped).map((group) => ({
    ...group[0],
    kills: sumBy(group, (p) => p.kills ?? 0),
    deaths: sumBy(group, (p) => p.deaths ?? 0),
    assists: sumBy(group, (p) => p.assists ?? 0),
    headshots: sumBy(group, (p) => p.headshots ?? 0),
    adr: sumBy(group, (p) => p.adr ?? 0) / group.length,
  }));
  return orderBy(aggregated, [(p) => p.kills], ["desc"]);
}

function TeamTables({
  teams,
  maps,
  winners,
  eventSlug,
}: {
  teams: TeamData[];
  maps: MapData[];
  winners: (boolean | null | undefined)[];
  eventSlug: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {teams.slice(0, 2).map((team, index) => (
        <PlayerTable
          key={team.id}
          players={aggregatePlayers(maps, team.faction_id)}
          team={team}
          isWinner={winners[index]}
          eventSlug={eventSlug}
        />
      ))}
    </div>
  );
}

export function EventMatchView({
  slug,
  matchId,
}: {
  slug: string;
  matchId: string;
}) {
  const { data: matches, isLoading } = useEventData(slug);
  const [activeTab, setActiveTab] = useState<"overall" | number>("overall");

  if (isLoading) return <Loading />;

  const match = matches?.find((m) => m.match_id === matchId);
  if (!match) return notFound();

  const maps = [...match.maps].sort((a, b) => a.match_round - b.match_round);
  const showOverall = maps.length > 1;
  const selected =
    activeTab === "overall" && showOverall
      ? undefined
      : maps[activeTab === "overall" ? 0 : activeTab];

  const mapWinners = (map: MapData) =>
    match.teams.map(
      (team) =>
        map.team_stats.find((ts) => ts.faction_id === team.faction_id)
          ?.is_winner,
    );

  return (
    <div className="flex flex-col gap-6">
      <SeriesHeader match={match} slug={slug} />

      {maps.length === 0 ? (
        <div className="rounded-xl border border-border border-dashed px-5 py-10 text-center text-muted-foreground text-sm">
          No map data yet.
        </div>
      ) : (
        <>
          {showOverall && (
            <div
              role="tablist"
              aria-label="Maps"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
            >
              {(["overall", ...maps.map((_, index) => index)] as const).map(
                (tab) => {
                  const map = tab === "overall" ? undefined : maps[tab];
                  const [w1, w2] = map ? mapWinners(map) : [];
                  const scores = map
                    ? match.teams.map(
                        (team) =>
                          map.team_stats.find(
                            (ts) => ts.faction_id === team.faction_id,
                          )?.final_score,
                      )
                    : [];
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "flex shrink-0 flex-col items-start rounded-lg border px-3.5 py-2 text-left transition-colors",
                        active
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-card hover:border-border-strong",
                      )}
                    >
                      <span className="font-semibold text-sm capitalize">
                        {map ? map.map_name?.replace("de_", "") : "Overall"}
                      </span>
                      <span className="font-mono text-muted-foreground text-xs tabular-nums">
                        {map ? (
                          <>
                            <span className={cn(w1 && "text-win")}>
                              {scores[0] ?? "–"}
                            </span>
                            :
                            <span className={cn(w2 && "text-win")}>
                              {scores[1] ?? "–"}
                            </span>
                          </>
                        ) : (
                          `${maps.length} maps`
                        )}
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {selected ? (
            <div className="flex flex-col gap-4">
              <MapScoreStrip map={selected} teams={match.teams} />
              <TeamTables
                teams={match.teams}
                maps={[selected]}
                winners={mapWinners(selected)}
                eventSlug={slug}
              />
            </div>
          ) : (
            <TeamTables
              teams={match.teams}
              maps={maps}
              winners={match.teams.map((t) => t.is_winner)}
              eventSlug={slug}
            />
          )}
        </>
      )}
    </div>
  );
}
