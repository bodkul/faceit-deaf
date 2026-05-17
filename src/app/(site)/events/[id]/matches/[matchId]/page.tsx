"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

import { MapBackground } from "@/components/map-background";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { type EventMatch, useEventData } from "@/hooks/useEventData";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string; matchId: string }>;
};

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-32 bg-neutral-900" />
      <Skeleton className="h-40 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

type MapData = EventMatch["maps"][number];
type TeamData = EventMatch["teams"][number];

function MapBlock({
  mapData,
  teams,
  mapIndex,
  totalMaps,
  eventId,
}: {
  mapData: MapData;
  teams: TeamData[];
  mapIndex: number;
  totalMaps: number;
  eventId: string;
}) {
  const t1Team = teams[0];
  const t2Team = teams[1];

  const t1Stats = mapData.team_stats.find(
    (ts) => ts.faction_id === t1Team?.faction_id,
  );
  const t2Stats = mapData.team_stats.find(
    (ts) => ts.faction_id === t2Team?.faction_id,
  );

  const t1Players = mapData.player_stats
    .filter((ps) => ps.faction_id === t1Team?.faction_id)
    .sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0));
  const t2Players = mapData.player_stats
    .filter((ps) => ps.faction_id === t2Team?.faction_id)
    .sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0));

  const mapLabel = mapData.map_name.replace("de_", "");

  function renderPlayerTable(
    players: typeof t1Players,
    teamStats: typeof t1Stats,
    teamData: typeof t1Team,
  ) {
    return (
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
          <Avatar className="size-7 rounded-lg">
            <AvatarFallback className="rounded-lg text-xs">
              {teamData?.team_name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm text-white">
            {teamData?.team_name ?? "Unknown"}
          </span>
          {teamStats?.is_winner && (
            <span className="ml-auto font-bold font-mono text-emerald-400 text-sm">
              WIN
            </span>
          )}
          {teamStats?.is_winner === false && (
            <span className="ml-auto font-mono text-red-400 text-sm">LOSS</span>
          )}
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-max min-w-full">
            <colgroup>
              <col className="w-44" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-neutral-800/50 border-b">
                {["Player", "K", "D", "A", "KD", "ADR", "HS%"].map((h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                      i === 0 ? "text-left" : "text-right",
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const k = p.kills ?? 0;
                const d = p.deaths ?? 0;
                const kd = k / Math.max(d, 1);
                const hs = ((p.headshots ?? 0) / Math.max(k, 1)) * 100;
                return (
                  <tr
                    key={p.id}
                    className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/events/${eventId}/players/${encodeURIComponent(p.player_id)}`}
                        className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                      >
                        {p.nickname}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-300 text-sm">
                      {k}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {d}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {p.assists ?? "—"}
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
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {p.adr?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {hs.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <MapBackground map={mapData.map_name} />
        <div className="relative px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
              <IconMapPin size={12} className="text-neutral-500" />
              <span className="font-mono text-neutral-300 text-xs capitalize">
                {mapLabel}
              </span>
              {totalMaps > 1 && (
                <span className="ml-1 text-neutral-600 text-xs">
                  · Map {mapIndex + 1}
                </span>
              )}
            </div>
            {mapData.total_rounds != null && (
              <span className="font-mono text-neutral-600 text-xs">
                {mapData.total_rounds} rounds
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-xl">
                <AvatarFallback className="rounded-xl">
                  {t1Team?.team_name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-white">
                {t1Team?.team_name ?? "—"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": t1Stats?.is_winner === true,
                    "text-red-400": t1Stats?.is_winner === false,
                    "text-neutral-400": t1Stats?.is_winner == null,
                  })}
                >
                  {t1Stats?.final_score ?? "—"}
                </span>
                <span className="font-mono text-neutral-700">:</span>
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": t2Stats?.is_winner === true,
                    "text-red-400": t2Stats?.is_winner === false,
                    "text-neutral-400": t2Stats?.is_winner == null,
                  })}
                >
                  {t2Stats?.final_score ?? "—"}
                </span>
              </div>

              {(t1Stats?.first_half_score != null ||
                t1Stats?.second_half_score != null) && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      1H
                    </span>
                    <span className="text-neutral-400">
                      {t1Stats?.first_half_score ?? "—"} :{" "}
                      {t2Stats?.first_half_score ?? "—"}
                    </span>
                  </div>
                  <span className="text-neutral-800">·</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      2H
                    </span>
                    <span className="text-neutral-400">
                      {t1Stats?.second_half_score ?? "—"} :{" "}
                      {t2Stats?.second_half_score ?? "—"}
                    </span>
                  </div>
                  {t1Stats?.overtime_score != null &&
                    t1Stats.overtime_score > 0 && (
                      <>
                        <span className="text-neutral-800">·</span>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-neutral-600 uppercase tracking-widest">
                            OT
                          </span>
                          <span className="text-yellow-500/80">
                            {t1Stats.overtime_score} :{" "}
                            {t2Stats?.overtime_score ?? 0}
                          </span>
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <span className="font-bold text-white">
                {t2Team?.team_name ?? "—"}
              </span>
              <Avatar className="size-10 rounded-xl">
                <AvatarFallback className="rounded-xl">
                  {t2Team?.team_name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {renderPlayerTable(t1Players, t1Stats, t1Team)}
      {renderPlayerTable(t2Players, t2Stats, t2Team)}
    </div>
  );
}

export default function EventMatchPage(props: PageProps) {
  const { id, matchId } = use(props.params);
  const { data: matches = [], isLoading } = useEventData(id);
  const [activeMap, setActiveMap] = useState(0);

  if (isLoading)
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
        <Loading />
      </div>
    );

  const match = matches.find((m) => m.match_id === matchId);
  if (!match) return notFound();

  const t1 = match.teams[0];
  const t2 = match.teams[1];
  const sortedMaps = [...match.maps].sort(
    (a, b) => a.match_round - b.match_round,
  );

  const currentMap = sortedMaps[activeMap];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href={`/events/${id}?tab=matches`}>
          <IconArrowLeft size={14} className="mr-1" />
          Back to Event
        </Link>
      </Button>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar className="size-10 shrink-0 rounded-xl">
            <AvatarFallback className="rounded-xl">
              {t1?.team_name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/events/${id}/teams/${encodeURIComponent(t1?.faction_id ?? "")}`}
            className="truncate font-bold text-white transition-colors hover:text-neutral-300"
          >
            {t1?.team_name ?? "TBD"}
          </Link>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="flex items-center gap-3 font-black font-mono text-3xl tabular-nums">
            <span
              className={cn({
                "text-emerald-400": t1?.is_winner === true,
                "text-red-400": t1?.is_winner === false,
                "text-neutral-300": t1?.is_winner == null,
              })}
            >
              {match.score_faction1 ?? "—"}
            </span>
            <span className="text-neutral-700">:</span>
            <span
              className={cn({
                "text-emerald-400": t2?.is_winner === true,
                "text-red-400": t2?.is_winner === false,
                "text-neutral-300": t2?.is_winner == null,
              })}
            >
              {match.score_faction2 ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-600 text-xs">
              Bo{match.best_of ?? sortedMaps.length}
            </span>
            {match.started_at && (
              <span className="font-mono text-neutral-600 text-xs">
                · {format(new Date(match.started_at), "dd/MM/yyyy")}
              </span>
            )}
            <Button variant="dark" size="sm" asChild className="ml-2">
              <Link
                href={`https://www.faceit.com/en/cs2/room/1-${match.match_id}`}
                target="_blank"
              >
                FACEIT <IconExternalLink size={12} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          <Link
            href={`/events/${id}/teams/${encodeURIComponent(t2?.faction_id ?? "")}`}
            className="truncate font-bold text-white transition-colors hover:text-neutral-300"
          >
            {t2?.team_name ?? "TBD"}
          </Link>
          <Avatar className="size-10 shrink-0 rounded-xl">
            <AvatarFallback className="rounded-xl">
              {t2?.team_name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {sortedMaps.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-10 text-center text-neutral-500 text-sm">
          No map data available
        </div>
      ) : (
        <>
          {sortedMaps.length > 1 && (
            <div className="flex w-fit gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1">
              {sortedMaps.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMap(idx)}
                  className={cn(
                    "rounded-lg px-4 py-1.5 font-mono text-sm capitalize transition-colors",
                    activeMap === idx
                      ? "bg-neutral-800 text-white shadow-sm"
                      : "text-neutral-500 hover:text-neutral-300",
                  )}
                >
                  {m.map_name.replace("de_", "")}
                </button>
              ))}
            </div>
          )}

          {currentMap && (
            <MapBlock
              key={currentMap.id}
              mapData={currentMap}
              teams={match.teams}
              mapIndex={activeMap}
              totalMaps={sortedMaps.length}
              eventId={id}
            />
          )}
        </>
      )}
    </div>
  );
}
