"use client";

import { cn } from "cn";
import { format } from "date-fns";
import { orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventData } from "@/features/events/hooks/use-event-data";

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-32 bg-neutral-900" />
      <Skeleton className="h-28 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-16 w-full rounded-xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

export function EventPlayerView({
  slug,
  playerId,
}: {
  slug: string;
  playerId: string;
}) {
  const { data: matches = [], isLoading } = useEventData(slug);

  if (isLoading) return <Loading />;
  if (!matches) return notFound();

  const mapRows = orderBy(
    matches.flatMap((match) =>
      match.maps.flatMap((mapData) => {
        const ps = mapData.player_stats.find((p) => p.player_id === playerId);
        if (!ps) return [];

        const kills = ps.kills ?? 0;
        const deaths = ps.deaths ?? 0;
        const headshots = ps.headshots ?? 0;
        const teamStat = mapData.team_stats.find(
          (ts) => ts.faction_id === ps.faction_id,
        );
        const teamInfo = match.teams.find(
          (t) => t.faction_id === ps.faction_id,
        );

        return [
          {
            match_id: match.match_id,
            started_at: match.started_at ?? null,
            map_name: mapData.map_name,
            match_round: mapData.match_round,
            nickname: ps.nickname,
            kills,
            deaths,
            assists: ps.assists ?? 0,
            headshots,
            adr: ps.adr,
            kd: kills / Math.max(deaths, 1),
            hs_pct: (headshots / Math.max(kills, 1)) * 100,
            mvps: ps.mvps ?? 0,
            result: ps.result,
            team_name: teamInfo?.team_name ?? ps.faction_id,
            is_winner: teamStat?.is_winner,
          },
        ];
      }),
    ),
    [(r) => r.match_id, (r) => r.match_round],
    ["desc", "asc"],
  );

  if (!mapRows.length) return notFound();

  const nickname = mapRows[0]?.nickname ?? decodeURIComponent(playerId);
  const mapsPlayed = mapRows.length;
  const mapsWon = mapRows.filter((r) => r.is_winner === true).length;
  const totalKills = sumBy(mapRows, (r) => r.kills);
  const totalDeaths = sumBy(mapRows, (r) => r.deaths);
  const totalHeadshots = sumBy(mapRows, (r) => r.headshots);
  const totalAdr = sumBy(mapRows, (r) => r.adr ?? 0);
  const totalMvps = sumBy(mapRows, (r) => r.mvps);

  const kd = totalKills / Math.max(totalDeaths, 1);
  const avgK = totalKills / mapsPlayed;
  const avgD = totalDeaths / mapsPlayed;
  const avgAdr = totalAdr / mapsPlayed;
  const hsPercent = (totalHeadshots / Math.max(totalKills, 1)) * 100;
  const winRate = (mapsWon / mapsPlayed) * 100;

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
    <div className="space-y-6">
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
                      href={`/events/${slug}/matches/${row.match_id}`}
                      className="font-mono text-neutral-300 text-sm capitalize transition-colors hover:text-white"
                    >
                      {row.map_name?.replace("de_", "")}
                    </Link>
                    {row.started_at && (
                      <p className="font-mono text-neutral-600 text-xs">
                        {format(row.started_at, "d MMM yyyy")}
                      </p>
                    )}
                  </td>
                  <td className="truncate px-4 py-2.5 text-neutral-500 text-sm">
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
                    {row.hs_pct.toFixed(1)}%
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
