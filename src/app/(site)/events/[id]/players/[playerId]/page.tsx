"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventData } from "@/hooks/useEventData";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string; playerId: string }>;
};

function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <Skeleton className="h-8 w-32 bg-neutral-900" />
      <Skeleton className="h-28 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-16 w-full rounded-xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

type MapRow = {
  match_id: string;
  map_name: string;
  match_round: number;
  kills: number;
  deaths: number;
  assists: number;
  adr: number | null;
  kd: number;
  hs: number;
  mvps: number;
  result: number | null;
  team_name: string;
  is_winner: boolean | null;
};

export default function EventPlayerPage(props: PageProps) {
  const { id, playerId } = use(props.params);
  const pid = decodeURIComponent(playerId);

  const { data: matches = [], isLoading } = useEventData(id);

  if (isLoading) return <Loading />;

  // Collect all map rows for this player
  const mapRows: MapRow[] = [];

  let totalKills = 0;
  let totalDeaths = 0;
  let totalHeadshots = 0;
  let totalAdr = 0;
  let totalMvps = 0;
  let mapsPlayed = 0;
  let mapsWon = 0;
  let nickname = pid;

  for (const match of matches) {
    if (match.status !== "FINISHED") continue;
    for (const mapData of match.maps) {
      const ps = mapData.player_stats.find((p) => p.player_id === pid);
      if (!ps) continue;

      const k = ps.kills ?? 0;
      const d = ps.deaths ?? 0;
      const hs = ps.headshots ?? 0;

      nickname = ps.nickname;

      totalKills += k;
      totalDeaths += d;
      totalHeadshots += hs;
      totalAdr += ps.adr ?? 0;
      totalMvps += ps.mvps ?? 0;
      mapsPlayed++;

      // Find team result on this map
      const teamStat = mapData.team_stats.find(
        (ts) => ts.faction_id === ps.faction_id,
      );
      const teamInfo = match.teams.find((t) => t.faction_id === ps.faction_id);

      if (teamStat?.is_winner === true) mapsWon++;

      mapRows.push({
        match_id: match.match_id,
        map_name: mapData.map_name,
        match_round: mapData.match_round,
        kills: k,
        deaths: d,
        assists: ps.assists ?? 0,
        adr: ps.adr,
        kd: k / Math.max(d, 1),
        hs: (hs / Math.max(k, 1)) * 100,
        mvps: ps.mvps ?? 0,
        result: ps.result,
        team_name: teamInfo?.team_name ?? ps.faction_id,
        is_winner: teamStat?.is_winner ?? null,
      });
    }
  }

  if (!mapsPlayed) return notFound();

  // Sort by match then map round
  mapRows.sort((a, b) => {
    const matchCmp = b.match_id.localeCompare(a.match_id);
    return matchCmp !== 0 ? matchCmp : a.match_round - b.match_round;
  });

  const kd = totalKills / Math.max(totalDeaths, 1);
  const avgK = totalKills / Math.max(mapsPlayed, 1);
  const avgD = totalDeaths / Math.max(mapsPlayed, 1);
  const avgAdr = totalAdr / Math.max(mapsPlayed, 1);
  const hsPercent = (totalHeadshots / Math.max(totalKills, 1)) * 100;
  const winRate = (mapsWon / Math.max(mapsPlayed, 1)) * 100;

  const stats = [
    {
      label: "KD",
      value: kd.toFixed(2),
      color: kd >= 1 ? "text-emerald-400" : "text-red-400",
    },
    { label: "Avg K", value: avgK.toFixed(1), color: "text-neutral-200" },
    { label: "Avg D", value: avgD.toFixed(1), color: "text-neutral-400" },
    { label: "ADR", value: avgAdr.toFixed(1), color: "text-neutral-200" },
    {
      label: "HS%",
      value: `${hsPercent.toFixed(1)}%`,
      color: "text-neutral-400",
    },
    {
      label: "Win Rate",
      value: `${winRate.toFixed(0)}%`,
      color: winRate >= 50 ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href={`/events/${id}?tab=players`}>
          <IconArrowLeft size={14} className="mr-1" />
          Back to Event
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-14 rounded-xl">
            <AvatarFallback className="rounded-xl text-lg">
              {nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-black text-2xl text-white">{nickname}</h1>
            <p className="text-neutral-500 text-sm">
              {mapsPlayed} maps · {mapsWon}W {mapsPlayed - mapsWon}L
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="font-bold font-mono text-3xl text-yellow-400">
              {totalMvps}
            </div>
            <div className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
              MVPs
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px border-neutral-800 border-t sm:grid-cols-6">
          {stats.map(({ label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 bg-neutral-900/40 px-4 py-3"
            >
              <span
                className={cn(
                  "font-bold font-mono text-lg tabular-nums",
                  color,
                )}
              >
                {value}
              </span>
              <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="border-neutral-800 border-b px-5 py-4">
          <h3 className="font-bold text-white">Map History</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-max min-w-full">
            <colgroup>
              <col className="w-4" />
              <col className="w-28" />
              <col className="w-36" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-neutral-800/50 border-b">
                {(
                  [
                    { key: "result", label: "", right: false },
                    { key: "map", label: "Map", right: false },
                    { key: "team", label: "Team", right: false },
                    { key: "k", label: "K", right: true },
                    { key: "d", label: "D", right: true },
                    { key: "a", label: "A", right: true },
                    { key: "kd", label: "KD", right: true },
                    { key: "adr", label: "ADR", right: true },
                    { key: "hs", label: "HS%", right: true },
                  ] as const
                ).map(({ key, label, right }) => (
                  <th
                    key={key}
                    className={cn(
                      "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                      right ? "text-right" : "text-left",
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mapRows.map((row) => (
                <tr
                  key={`${row.match_id}-${row.match_round}`}
                  className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                >
                  <td className="px-4 py-2.5">
                    <div
                      className={cn("size-1.5 rounded-full", {
                        "bg-emerald-400": row.is_winner === true,
                        "bg-red-400": row.is_winner === false,
                        "bg-neutral-600": row.is_winner == null,
                      })}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/events/${id}/matches/${row.match_id}`}
                      className="font-mono text-neutral-300 text-sm capitalize transition-colors hover:text-white"
                    >
                      {row.map_name.replace("de_", "")}
                    </Link>
                  </td>
                  <td className="max-w-36 truncate px-4 py-2.5 text-neutral-500 text-sm">
                    {row.team_name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-300 text-sm">
                    {row.kills}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {row.deaths}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {row.assists}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    <span
                      className={
                        row.kd >= 1 ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {row.kd.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {row.adr?.toFixed(1) ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {row.hs.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
