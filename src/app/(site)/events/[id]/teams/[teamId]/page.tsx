"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type EventMatch, useEventData } from "@/hooks/useEventData";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string; teamId: string }>;
};

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

type PlayerAgg = {
  player_id: string;
  nickname: string;
  maps: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  adr: number;
  mvps: number;
};

type MatchHistoryRow = {
  match_id: string;
  win: boolean | null;
  score_for: number | null;
  score_against: number | null;
  enemy_name: string;
  maps_won: number;
  maps_lost: number;
};

export default function EventTeamPage(props: PageProps) {
  const { id, teamId } = use(props.params);
  const factionId = decodeURIComponent(teamId);

  const { data: matches = [], isLoading } = useEventData(id);

  if (isLoading) return <Loading />;

  // Find all matches where this team participated
  const teamMatches: EventMatch[] = matches.filter((m) =>
    m.teams.some((t) => t.faction_id === factionId),
  );

  if (!teamMatches.length) return notFound();

  // Find team metadata from first occurrence
  const teamMeta = teamMatches[0].teams.find((t) => t.faction_id === factionId);
  const teamName = teamMeta?.team_name ?? factionId;

  // Build match history
  const history: MatchHistoryRow[] = [];
  let wins = 0;
  let losses = 0;

  for (const match of teamMatches) {
    if (match.status !== "FINISHED") continue;

    const myTeam = match.teams.find((t) => t.faction_id === factionId);
    const enemyTeam = match.teams.find((t) => t.faction_id !== factionId);

    const win = myTeam?.is_winner ?? null;
    if (win === true) wins++;
    else if (win === false) losses++;

    // Count maps won/lost
    let mapsWon = 0;
    let mapsLost = 0;
    for (const mapData of match.maps) {
      if (!mapData.winner_faction_id) continue;
      if (mapData.winner_faction_id === factionId) mapsWon++;
      else mapsLost++;
    }

    history.push({
      match_id: match.match_id,
      win,
      score_for:
        myTeam?.is_winner === true
          ? (match.score_faction1 ?? null)
          : (match.score_faction2 ?? null),
      score_against:
        myTeam?.is_winner === true
          ? (match.score_faction2 ?? null)
          : (match.score_faction1 ?? null),
      enemy_name: enemyTeam?.team_name ?? "Unknown",
      maps_won: mapsWon,
      maps_lost: mapsLost,
    });
  }

  // Aggregate player stats from all maps
  const playerMap: Record<string, PlayerAgg> = {};

  for (const match of teamMatches) {
    if (match.status !== "FINISHED") continue;
    for (const mapData of match.maps) {
      for (const ps of mapData.player_stats) {
        if (ps.faction_id !== factionId) continue;
        const pid = ps.player_id;
        if (!playerMap[pid]) {
          playerMap[pid] = {
            player_id: pid,
            nickname: ps.nickname,
            maps: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            adr: 0,
            mvps: 0,
          };
        }
        playerMap[pid].maps++;
        playerMap[pid].kills += ps.kills ?? 0;
        playerMap[pid].deaths += ps.deaths ?? 0;
        playerMap[pid].assists += ps.assists ?? 0;
        playerMap[pid].headshots += ps.headshots ?? 0;
        playerMap[pid].adr += ps.adr ?? 0;
        playerMap[pid].mvps += ps.mvps ?? 0;
      }
    }
  }

  const players = Object.values(playerMap).sort(
    (a, b) => b.kills / Math.max(b.deaths, 1) - a.kills / Math.max(a.deaths, 1),
  );

  const totalMatches = wins + losses;

  return (
    <div className="space-y-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href={`/events/${id}?tab=teams`}>
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
                  const avgK = p.kills / Math.max(p.maps, 1);
                  const avgD = p.deaths / Math.max(p.maps, 1);
                  const avgAdr = p.adr / Math.max(p.maps, 1);
                  return (
                    <tr
                      key={p.player_id}
                      className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/events/${id}/players/${encodeURIComponent(p.player_id)}`}
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
                href={`/events/${id}/matches/${row.match_id}`}
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
