"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { cn } from "cn";
import { format } from "date-fns";
import { groupBy, orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/section-header";
import {
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { TeamAvatar } from "@/components/team-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventData } from "@/features/events/hooks/use-event-data";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { teamHref } from "@/features/teams/lib/team-href";

function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function EventTeamView({
  slug,
  teamId: rawTeamName,
}: {
  slug: string;
  teamId: string;
}) {
  const teamName = decodeURIComponent(rawTeamName);

  const { data: matches = [], isLoading } = useEventData(slug);

  if (isLoading) return <Loading />;

  const isOurs = (name: string) => normalizeTeamName(name) === teamName;

  const history = orderBy(
    matches
      .filter((match) => match.teams.some((t) => isOurs(t.team_name)))
      .map((match) => {
        const myTeam = match.teams.find((t) => isOurs(t.team_name));
        const enemyTeam = match.teams.find((t) => !isOurs(t.team_name));

        const mapsWon = match.maps.filter(
          (m) => m.winner_faction_id === myTeam?.faction_id,
        ).length;
        const mapsLost = match.maps.filter(
          (m) =>
            m.winner_faction_id != null &&
            m.winner_faction_id !== myTeam?.faction_id,
        ).length;

        return {
          match_id: match.match_id,
          started_at: match.started_at ?? null,
          win: mapsWon > mapsLost ? true : mapsWon < mapsLost ? false : null,
          enemy_name: enemyTeam
            ? normalizeTeamName(enemyTeam.team_name)
            : "Unknown",
          maps_won: mapsWon,
          maps_lost: mapsLost,
        };
      }),
    [(r) => r.started_at ?? ""],
    ["desc"],
  );

  if (!history.length) return notFound();

  const wins = history.filter((r) => r.win === true).length;
  const losses = history.filter((r) => r.win === false).length;

  const playerGroups = groupBy(
    matches.flatMap((match) => {
      const myTeam = match.teams.find((t) => isOurs(t.team_name));
      if (!myTeam) return [];
      return match.maps.flatMap((mapData) =>
        mapData.player_stats.filter(
          (ps) => ps.faction_id === myTeam.faction_id,
        ),
      );
    }),
    (ps) => ps.player_id,
  );

  const players = orderBy(
    Object.entries(playerGroups).map(([player_id, stats]) => ({
      player_id,
      nickname: stats[0]?.nickname ?? player_id,
      maps: stats.length,
      kills: sumBy(stats, (s) => s.kills ?? 0),
      deaths: sumBy(stats, (s) => s.deaths ?? 0),
      adr_total: sumBy(stats, (s) => s.adr ?? 0),
      mvps: sumBy(stats, (s) => s.mvps ?? 0),
    })),
    [(p) => p.kills / Math.max(p.deaths, 1)],
    ["desc"],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-border border-b px-4 py-3 sm:px-6">
          <Link
            href={`/events/${slug}/teams`}
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            All teams
          </Link>
          <Link
            href={teamHref(teamName)}
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            Team profile
            <IconArrowRight className="size-4" />
          </Link>
        </div>
        <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
          <TeamAvatar name={teamName} className="size-14 rounded-xl" />
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate font-black text-2xl tracking-tight">
              {teamName}
            </h2>
            <p className="text-muted-foreground text-sm">
              {history.length} {history.length === 1 ? "series" : "series"}{" "}
              played
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1 font-black font-mono text-3xl tabular-nums">
            <span className="text-win">{wins}</span>
            <span className="text-faint text-xl">–</span>
            <span className="text-loss">{losses}</span>
          </div>
        </div>
      </section>

      {players.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Roster" description="Totals across the event" />
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            <StatsTable minWidth={560}>
              <thead className="border-border border-b">
                <tr>
                  <StatsTh sticky align="left">
                    Player
                  </StatsTh>
                  <StatsTh>Maps</StatsTh>
                  <StatsTh>K/D</StatsTh>
                  <StatsTh>Avg K</StatsTh>
                  <StatsTh>Avg D</StatsTh>
                  <StatsTh>ADR</StatsTh>
                  <StatsTh>MVP</StatsTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players.map((p) => {
                  const kd = p.kills / Math.max(p.deaths, 1);
                  return (
                    <tr
                      key={p.player_id}
                      className="transition-colors hover:bg-foreground/3"
                    >
                      <StatsTd sticky align="left" numeric={false}>
                        <Link
                          href={`/events/${slug}/players/${encodeURIComponent(p.player_id)}`}
                          className="block max-w-40 truncate font-medium transition-colors hover:text-primary"
                        >
                          {p.nickname}
                        </Link>
                      </StatsTd>
                      <StatsTd tone="muted">{p.maps}</StatsTd>
                      <StatsTd tone={ratioTone(kd)} className="font-semibold">
                        {kd.toFixed(2)}
                      </StatsTd>
                      <StatsTd tone="strong">
                        {(p.kills / p.maps).toFixed(1)}
                      </StatsTd>
                      <StatsTd>{(p.deaths / p.maps).toFixed(1)}</StatsTd>
                      <StatsTd>{(p.adr_total / p.maps).toFixed(1)}</StatsTd>
                      <StatsTd tone={p.mvps > 0 ? "warning" : "muted"}>
                        {p.mvps}
                      </StatsTd>
                    </tr>
                  );
                })}
              </tbody>
            </StatsTable>
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader title="Results" />
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
          {history.map((row) => (
            <Link
              key={row.match_id}
              href={`/events/${slug}/matches/${row.match_id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/3"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md font-bold font-mono text-xs",
                  row.win === true && "bg-win/15 text-win",
                  row.win === false && "bg-loss/15 text-loss",
                  row.win == null && "bg-muted text-faint",
                )}
              >
                {row.win === true ? "W" : row.win === false ? "L" : "–"}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                <span className="text-muted-foreground">vs </span>
                {row.enemy_name}
              </span>
              {row.started_at && (
                <span className="hidden font-mono text-faint text-xs sm:inline">
                  {format(row.started_at, "d MMM, HH:mm")}
                </span>
              )}
              <span className="font-bold font-mono tabular-nums">
                {row.maps_won}:{row.maps_lost}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
