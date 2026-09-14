"use client";

import { IconMapPin } from "@tabler/icons-react";
import { cn } from "cn";
import { format } from "date-fns";
import { flatMap, groupBy, orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

import { MapBackground } from "@/components/map-background";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { type EventMatch, useEventData } from "@/hooks/use-event-data";

type MapData = EventMatch["maps"][number];
type TeamData = EventMatch["teams"][number];

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

type PlayerData = EventMatch["maps"][number]["player_stats"][number];

function PlayerTable({
  players,
  teamData,
  isWinner,
  eventSlug,
}: {
  players: PlayerData[];
  teamData: TeamData | undefined;
  isWinner?: boolean | null;
  score?: number | null;
  eventSlug: string;
}) {
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
        {isWinner != null && (
          <span
            className={cn("ml-auto font-bold font-mono text-xs", {
              "text-emerald-400": isWinner === true,
              "text-red-400": isWinner === false,
            })}
          >
            {isWinner ? "WIN" : "LOSS"}
          </span>
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
                      href={`/events/${eventSlug}/players/${encodeURIComponent(p.player_id)}`}
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
                      className={kd >= 1 ? "text-emerald-400" : "text-red-400"}
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

function OverallView({
  match,
  teams,
  maps,
  eventSlug,
}: {
  match: EventMatch;
  teams: TeamData[];
  maps: MapData[];
  eventSlug: string;
}) {
  const t1Team = teams[0];
  const t2Team = teams[1];
  const t1Win = t1Team?.is_winner === true;
  const t2Win = t2Team?.is_winner === true;

  const aggregatePlayers = (factionId?: string | null) => {
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
    }));
    return orderBy(aggregated, [(p) => p.kills], ["desc"]);
  };

  const t1Players = aggregatePlayers(t1Team?.faction_id);
  const t2Players = aggregatePlayers(t2Team?.faction_id);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="relative px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
              <span className="font-mono text-neutral-300 text-xs">
                Bo{match.best_of ?? maps.length}
              </span>
              <span className="ml-1 text-neutral-600 text-xs">· Series</span>
            </div>
            {match.started_at && (
              <span className="font-mono text-neutral-600 text-xs">
                {format(match.started_at, "dd/MM/yyyy")}
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

            <div className="flex items-center justify-center gap-3">
              <span
                className={cn("font-black font-mono text-4xl tabular-nums", {
                  "text-emerald-400": t1Win,
                  "text-red-400": !t1Win && t2Win,
                  "text-neutral-400": !t1Win && !t2Win,
                })}
              >
                {match.score_faction1 ?? "—"}
              </span>
              <span className="font-mono text-neutral-700">:</span>
              <span
                className={cn("font-black font-mono text-4xl tabular-nums", {
                  "text-emerald-400": t2Win,
                  "text-red-400": !t2Win && t1Win,
                  "text-neutral-400": !t1Win && !t2Win,
                })}
              >
                {match.score_faction2 ?? "—"}
              </span>
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

      <PlayerTable
        players={t1Players}
        teamData={t1Team}
        isWinner={t1Win}
        eventSlug={eventSlug}
      />
      <PlayerTable
        players={t2Players}
        teamData={t2Team}
        isWinner={t2Win}
        eventSlug={eventSlug}
      />
    </div>
  );
}

function MapView({
  mapData,
  teams,
  mapIndex,
  totalMaps,
  eventSlug,
  startedAt,
}: {
  mapData: MapData;
  teams: TeamData[];
  mapIndex: number;
  totalMaps: number;
  eventSlug: string;
  startedAt?: string | null;
}) {
  const t1Team = teams[0];
  const t2Team = teams[1];

  const t1Stats = mapData.team_stats.find(
    (ts) => ts.faction_id === t1Team?.faction_id,
  );
  const t2Stats = mapData.team_stats.find(
    (ts) => ts.faction_id === t2Team?.faction_id,
  );

  const t1Players = orderBy(
    mapData.player_stats.filter((ps) => ps.faction_id === t1Team?.faction_id),
    [(p) => p.kills ?? 0],
    ["desc"],
  );
  const t2Players = orderBy(
    mapData.player_stats.filter((ps) => ps.faction_id === t2Team?.faction_id),
    [(p) => p.kills ?? 0],
    ["desc"],
  );

  const mapLabel = mapData.map_name?.replace("de_", "");

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <MapBackground map={mapData.map_name} />
        <div className="relative px-6 py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
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
              {mapData.total_rounds != null && (
                <span className="ml-1 text-neutral-600 text-xs">
                  · {mapData.total_rounds} rounds
                </span>
              )}
            </div>
            {startedAt && (
              <span className="font-mono text-neutral-600 text-xs">
                {format(startedAt, "dd/MM/yyyy")}
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

      <PlayerTable
        players={t1Players}
        teamData={t1Team}
        isWinner={t1Stats?.is_winner}
        eventSlug={eventSlug}
      />
      <PlayerTable
        players={t2Players}
        teamData={t2Team}
        isWinner={t2Stats?.is_winner}
        eventSlug={eventSlug}
      />
    </div>
  );
}

export default function EventMatchPage(
  props: PageProps<"/events/[slug]/matches/[matchId]">,
) {
  const { slug, matchId } = use(props.params);
  const { data: matches, isLoading } = useEventData(slug);
  const [activeTab, setActiveTab] = useState<"overall" | number>("overall");

  if (isLoading)
    return (
      <div className="space-y-4">
        <Loading />
      </div>
    );

  const match = matches?.find((m) => m.match_id === matchId);
  if (!match) return notFound();

  const sortedMaps = [...match.maps].sort(
    (a, b) => a.match_round - b.match_round,
  );
  const currentMap =
    typeof activeTab === "number" ? sortedMaps[activeTab] : undefined;
  const isBo1 = sortedMaps.length === 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {!isBo1 && sortedMaps.length > 0 && (
          <div className="flex w-fit gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("overall")}
              className={cn(
                "rounded-lg px-4 py-1.5 font-mono text-sm capitalize transition-colors",
                activeTab === "overall"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              overall
            </button>
            {sortedMaps.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "rounded-lg px-4 py-1.5 font-mono text-sm capitalize transition-colors",
                  activeTab === idx
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-300",
                )}
              >
                {m.map_name?.replace("de_", "")}
              </button>
            ))}
          </div>
        )}
      </div>

      {sortedMaps.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-10 text-center text-neutral-500 text-sm">
          No map data available
        </div>
      ) : isBo1 ? (
        <MapView
          mapData={sortedMaps[0]}
          teams={match.teams}
          mapIndex={0}
          totalMaps={1}
          eventSlug={slug}
          startedAt={match.started_at}
        />
      ) : activeTab === "overall" ? (
        <OverallView
          match={match}
          teams={match.teams}
          maps={sortedMaps}
          eventSlug={slug}
        />
      ) : (
        currentMap && (
          <MapView
            key={currentMap.id}
            mapData={currentMap}
            teams={match.teams}
            mapIndex={activeTab as number}
            totalMaps={sortedMaps.length}
            eventSlug={slug}
            startedAt={match.started_at}
          />
        )
      )}
    </div>
  );
}
