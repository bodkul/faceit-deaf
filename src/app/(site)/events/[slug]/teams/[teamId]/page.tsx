"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { format } from "date-fns";
import { groupBy, orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventData } from "@/hooks/use-event-data";
import { cn } from "@/lib/utils";

function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <Skeleton className="h-8 w-32 bg-neutral-900" />
      <Skeleton className="h-28 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

export default function EventTeamPage(
  props: PageProps<"/events/[slug]/teams/[teamId]">,
) {
  const { slug, teamId } = use(props.params);

  const { data: matches = [], isLoading } = useEventData(slug);

  if (isLoading) return <Loading />;

  const teamName =
    matches.flatMap((m) => m.teams).find((t) => t.faction_id === teamId)
      ?.team_name ?? teamId;

  const history = orderBy(
    matches
      .filter((match) => match.teams.some((t) => t.faction_id === teamId))
      .map((match) => {
        const enemyTeam = match.teams.find((t) => t.faction_id !== teamId);
        const mapsWon = match.maps.filter(
          (m) => m.winner_faction_id === teamId,
        ).length;
        const mapsLost = match.maps.filter(
          (m) => m.winner_faction_id != null && m.winner_faction_id !== teamId,
        ).length;

        return {
          match_id: match.match_id,
          started_at: match.started_at ?? null,
          win: mapsWon > mapsLost ? true : mapsWon < mapsLost ? false : null,
          enemy_name: enemyTeam?.team_name ?? "Unknown",
          maps_won: mapsWon,
          maps_lost: mapsLost,
        };
      }),
    [(r) => r.match_id],
    ["desc"],
  );

  if (!history.length) return notFound();

  const wins = history.filter((r) => r.win === true).length;
  const losses = history.filter((r) => r.win === false).length;

  const playerGroups = groupBy(
    matches.flatMap((match) =>
      match.maps.flatMap((mapData) =>
        mapData.player_stats.filter((ps) => ps.faction_id === teamId),
      ),
    ),
    (ps) => ps.player_id,
  );

  const players = orderBy(
    Object.entries(playerGroups).map(([player_id, stats]) => ({
      player_id,
      nickname: stats[0]?.nickname ?? player_id,
      maps: stats.length,
      kills: sumBy(stats, (s) => s.kills ?? 0),
      deaths: sumBy(stats, (s) => s.deaths ?? 0),
      assists: sumBy(stats, (s) => s.assists ?? 0),
      headshots: sumBy(stats, (s) => s.headshots ?? 0),
      adr_total: sumBy(stats, (s) => s.adr ?? 0),
      mvps: sumBy(stats, (s) => s.mvps ?? 0),
    })),
    [(p) => p.kills / Math.max(p.deaths, 1)],
    ["desc"],
  );

  const totalMatches = wins + losses;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href={`/events/${slug}?tab=teams`}>
          <IconArrowLeft size={14} className="mr-1" />
          Back to Event
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-14 rounded-xl">
            <AvatarFallback className="rounded-xl text-lg">
              {teamName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-black text-2xl text-white">{teamName}</h1>
            <p className="text-neutral-500 text-sm">{totalMatches} matches</p>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-center">
              <div className="font-bold font-mono text-2xl text-emerald-400">
                {wins}
              </div>
              <div className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                W
              </div>
            </div>
            <div className="text-center">
              <div className="font-bold font-mono text-2xl text-red-400">
                {losses}
              </div>
              <div className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                L
              </div>
            </div>
          </div>
        </div>
      </div>

      {players.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="border-neutral-800 border-b px-5 py-4">
            <h3 className="font-bold text-white">Players</h3>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-max min-w-full">
              <colgroup>
                <col className="w-48" />
                <col className="w-16" />
                <col className="w-16" />
                <col className="w-14" />
                <col className="w-16" />
                <col className="w-16" />
                <col className="w-14" />
              </colgroup>
              <thead>
                <tr className="border-neutral-800/50 border-b">
                  {["Player", "Maps", "KD", "Avg K", "Avg D", "ADR", "MVP"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                          i === 0 ? "text-left" : "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  const kd = p.kills / Math.max(p.deaths, 1);
                  const avgK = p.kills / p.maps;
                  const avgD = p.deaths / p.maps;
                  const avgAdr = p.adr_total / p.maps;
                  return (
                    <tr
                      key={p.player_id}
                      className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/events/${slug}/players/${encodeURIComponent(p.player_id)}`}
                          className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                        >
                          {p.nickname}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                        {p.maps}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">
                        <span
                          className={
                            kd >= 1 ? "text-emerald-400" : "text-red-400"
                          }
                        >
                          {kd.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-neutral-200 text-sm">
                        {avgK.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                        {avgD.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                        {avgAdr.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm text-yellow-400">
                        {p.mvps}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
          <div className="border-neutral-800 border-b px-5 py-4">
            <h3 className="font-bold text-white">Match History</h3>
          </div>
          <div className="flex flex-col divide-y divide-neutral-800/50">
            {history.map((row) => (
              <Link
                key={row.match_id}
                href={`/events/${slug}/matches/${row.match_id}`}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-neutral-800/20"
              >
                <div
                  className={cn("size-1.5 shrink-0 rounded-full", {
                    "bg-emerald-400": row.win === true,
                    "bg-red-400": row.win === false,
                    "bg-neutral-600": row.win == null,
                  })}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-neutral-300 text-sm">
                  vs {row.enemy_name}
                </span>
                <div className="flex items-center gap-3">
                  {row.started_at && (
                    <span className="font-mono text-neutral-600 text-xs">
                      {format(row.started_at, "d MMM yyyy")}
                    </span>
                  )}
                  <span className="font-mono text-neutral-500 text-xs">
                    Maps: {row.maps_won}:{row.maps_lost}
                  </span>
                  <span
                    className={cn("font-bold font-mono text-sm", {
                      "text-emerald-400": row.win === true,
                      "text-red-400": row.win === false,
                      "text-neutral-500": row.win == null,
                    })}
                  >
                    {row.win === true
                      ? "WIN"
                      : row.win === false
                        ? "LOSS"
                        : "—"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
