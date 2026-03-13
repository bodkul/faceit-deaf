"use client";

import { IconRefresh, IconTrophy } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { orderBy } from "es-toolkit/compat";
import type { Match } from "faceit-sdk/hubs";
import type { MatchStats } from "faceit-sdk/matches";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { faceitSdk } from "@/lib/faceit";
import { cn } from "@/lib/utils";

const HUB_IDS = [
  "ea94cb7c-7b9f-49fc-9746-64916567e538",
  "05049049-fdf3-4d5b-afc9-a6818f86064a",
];

type Tab = "matches" | "standings" | "mvp";

type PlayerAgg = {
  nickname: string;
  avatar: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  mvp: number;
};

function useTournament() {
  return useQuery({
    queryKey: ["tournament"],
    queryFn: async () => {
      const allItems: Match[] = [];

      await Promise.all(
        HUB_IDS.map(async (hubId) => {
          const limit = 100;
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const { items } = await faceitSdk.hubs.getHubMatches(hubId, {
              type: "all",
              offset,
              limit,
            });
            allItems.push(...items);
            if (items.length < limit) hasMore = false;
            else offset += limit;
          }
        }),
      );

      const finished = allItems.filter((m) => m.status === "FINISHED");

      const statsResults = await Promise.all(
        finished.map(
          (m) =>
            faceitSdk.matches
              .getMatchStats(m.match_id)
              .catch(() => null) as Promise<MatchStats | null>,
        ),
      );

      return { matches: allItems, stats: statsResults };
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-red-400 text-xs">
      <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
      LIVE
    </span>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const f1 = match.teams.faction1;
  const f2 = match.teams.faction2;
  const score1 = match.results?.score?.faction1;
  const score2 = match.results?.score?.faction2;
  const winner = match.results?.winner;
  const map = match.voting?.map?.pick?.[0]?.replace("de_", "");
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-neutral-950 transition-colors",
        isLive ? "border-red-500/30" : "border-neutral-800",
      )}
    >
      {isLive && (
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
      )}
      <div className="flex items-center justify-between border-neutral-800 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {isLive && <LiveBadge />}
          {isFinished && (
            <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
              Finished
            </span>
          )}
          {!isLive && !isFinished && (
            <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
              Scheduled
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {map && (
            <span className="font-mono text-neutral-500 text-xs capitalize">
              {map}
            </span>
          )}
          {match.started_at && (
            <span className="font-mono text-neutral-600 text-xs">
              {format(match.started_at * 1000, "HH:mm")}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={f1.avatar} />
            <AvatarFallback className="rounded-lg text-xs">
              {f1.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn("truncate font-medium text-sm", {
              "text-emerald-400": isFinished && winner === "faction1",
              "text-red-400": isFinished && winner === "faction2",
              "text-white": !isFinished && winner === "faction1",
              "text-neutral-500": isFinished && winner === "faction2",
            })}
          >
            {f1.name}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <span
            className={cn("font-black font-mono text-2xl tabular-nums", {
              "text-emerald-400": isFinished && winner === "faction1",
              "text-red-400": isFinished && winner === "faction2",
              "text-neutral-400": !isFinished,
            })}
          >
            {score1 ?? "—"}
          </span>
          <span className="font-mono text-neutral-700 text-sm">:</span>
          <span
            className={cn("font-black font-mono text-2xl tabular-nums", {
              "text-emerald-400": isFinished && winner === "faction2",
              "text-red-400": isFinished && winner === "faction1",
              "text-neutral-400": !isFinished,
            })}
          >
            {score2 ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span
            className={cn("truncate text-right font-medium text-sm", {
              "text-emerald-400": isFinished && winner === "faction2",
              "text-red-400": isFinished && winner === "faction1",
              "text-white": !isFinished && winner === "faction2",
              "text-neutral-500": isFinished && winner === "faction1",
            })}
          >
            {f2.name}
          </span>
          <Avatar className="size-8 rounded-lg">
            <AvatarImage src={f2.avatar} />
            <AvatarFallback className="rounded-lg text-xs">
              {f2.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}

function MatchesTab({ matches }: { matches: Match[] }) {
  const live = matches.filter((m) => m.status === "LIVE");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");
  return (
    <div className="flex flex-col gap-6">
      {live.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            🔴 Live ({live.length})
          </h2>
          {live.map((m) => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      )}
      {scheduled.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            Upcoming ({scheduled.length})
          </h2>
          {scheduled.map((m) => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      )}
      {finished.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            Finished ({finished.length})
          </h2>
          {finished.map((m) => (
            <MatchCard key={m.match_id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function StandingsTab({ matches }: { matches: Match[] }) {
  const finished = matches.filter((m) => m.status === "FINISHED" && m.results);
  const teams: Record<
    string,
    { name: string; avatar: string; w: number; l: number }
  > = {};

  for (const match of finished) {
    const f1 = match.teams.faction1;
    const f2 = match.teams.faction2;
    const winner = match.results?.winner;
    if (!teams[f1.name])
      teams[f1.name] = { name: f1.name, avatar: f1.avatar, w: 0, l: 0 };
    if (!teams[f2.name])
      teams[f2.name] = { name: f2.name, avatar: f2.avatar, w: 0, l: 0 };
    if (winner === "faction1") {
      teams[f1.name].w++;
      teams[f2.name].l++;
    } else if (winner === "faction2") {
      teams[f2.name].w++;
      teams[f1.name].l++;
    }
  }

  const sorted = orderBy(Object.values(teams), ["w", "l"], ["desc", "asc"]);

  if (!sorted.length)
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-12 text-center text-neutral-600 text-sm">
        No finished matches yet
      </div>
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <table className="w-full">
        <thead>
          <tr className="border-neutral-800/50 border-b">
            {["#", "Team", "W", "L"].map((h, i) => (
              <th
                key={h}
                className={cn(
                  "px-4 py-3 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                  i <= 1 ? "text-left" : "text-center",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((team, i) => (
            <tr
              key={team.name}
              className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
            >
              <td className="px-4 py-3 font-mono text-neutral-600 text-sm">
                {i + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6 rounded-md">
                    <AvatarImage src={team.avatar} />
                    <AvatarFallback className="rounded-md text-xs">
                      {team.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-neutral-200 text-sm">
                    {team.name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center font-mono text-emerald-400 text-sm">
                {team.w}
              </td>
              <td className="px-4 py-3 text-center font-mono text-red-400 text-sm">
                {team.l}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function MVPTab({
  matches,
  stats,
}: {
  matches: Match[];
  stats: (MatchStats | null)[];
}) {
  const players: Record<string, PlayerAgg> = {};
  const finished = matches.filter((m) => m.status === "FINISHED");

  const avatarMap: Record<string, string> = {};
  for (const match of finished) {
    for (const p of [
      ...match.teams.faction1.roster,
      ...match.teams.faction2.roster,
    ]) {
      avatarMap[p.nickname] = p.avatar;
    }
  }

  for (const matchStats of stats) {
    if (!matchStats) continue;

    for (const round of matchStats.rounds) {
      for (const team of round.teams) {
        for (const p of team.players) {
          if (!players[p.player_id]) {
            players[p.player_id] = {
              nickname: p.nickname,
              avatar: avatarMap[p.nickname] ?? "",
              matches: 0,
              kills: 0,
              deaths: 0,
              assists: 0,
              headshots: 0,
              mvp: 0,
            };
          }
          const s = p.player_stats as unknown as Record<string, string>;
          players[p.player_id].matches++;
          players[p.player_id].kills += Number(s.Kills);
          players[p.player_id].deaths += Number(s.Deaths);
          players[p.player_id].assists += Number(s.Assists);
          players[p.player_id].headshots += Number(s.Headshots);
          players[p.player_id].mvp += Number(s.MVPs);
        }
      }
    }
  }

  const sorted = orderBy(
    Object.values(players),
    [(p) => p.mvp, (p) => p.kills / Math.max(p.matches, 1)],
    ["desc", "desc"],
  );

  if (!sorted.length)
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-12 text-center text-neutral-600 text-sm">
        No stats yet
      </div>
    );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="border-neutral-800 border-b px-5 py-4">
        <h3 className="font-bold text-white">Player Statistics</h3>
        <p className="text-neutral-500 text-sm">Sorted by MVP count</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <colgroup>
            <col className="w-10" />
            <col className="w-44" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-20" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-neutral-800/50 border-b">
              {["#", "Player", "M", "MVP", "Avg K", "Avg D", "KD", "HS%"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                      i <= 1 ? "text-left" : "text-right",
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const avgK = p.kills / Math.max(p.matches, 1);
              const avgD = p.deaths / Math.max(p.matches, 1);
              const kd = p.kills / Math.max(p.deaths, 1);
              const hs = (p.headshots / Math.max(p.kills, 1)) * 100;
              return (
                <tr
                  key={p.nickname}
                  className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                >
                  <td className="px-4 py-2.5 font-mono text-neutral-600 text-sm">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 rounded-md">
                        <AvatarImage src={p.avatar} />
                        <AvatarFallback className="rounded-md text-xs">
                          {p.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-neutral-200 text-sm">
                        {p.nickname}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {p.matches}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    <span
                      className={cn(
                        p.mvp > 0 ? "text-yellow-400" : "text-neutral-600",
                      )}
                    >
                      {p.mvp > 0 ? `⭐️ ${p.mvp}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-200 text-sm">
                    {avgK.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {avgD.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums">
                    <span
                      className={cn(
                        kd >= 1 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {kd.toFixed(2)}
                    </span>
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

const TABS: { id: Tab; label: string }[] = [
  { id: "matches", label: "Matches" },
  { id: "standings", label: "Standings" },
  { id: "mvp", label: "MVP" },
];

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("matches");

  const {
    data: { matches, stats } = { matches: [], stats: [] },
    isLoading,
    refetch,
    isFetching,
  } = useTournament();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-black text-2xl text-white">
              <IconTrophy size={24} className="text-yellow-400" />
              ESDUA Tournament
            </h1>
            <p className="text-neutral-500 text-sm">
              Hub matches · Group stage
            </p>
          </div>
          <Button
            variant="dark"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <IconRefresh
              size={14}
              className={cn(isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
        <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 rounded-lg px-4 py-2 font-medium text-sm transition-all",
                activeTab === tab.id
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => `skeleton-${i}`).map((key) => (
              <Skeleton
                key={key}
                className="h-24 w-full rounded-xl bg-neutral-900"
              />
            ))}
          </div>
        ) : (
          <>
            {activeTab === "matches" && <MatchesTab matches={matches} />}
            {activeTab === "standings" && <StandingsTab matches={matches} />}
            {activeTab === "mvp" && <MVPTab matches={matches} stats={stats} />}
          </>
        )}
      </div>
    </div>
  );
}
