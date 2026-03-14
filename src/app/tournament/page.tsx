"use client";

import { IconRefresh, IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import { orderBy } from "es-toolkit/compat";
import Link from "next/link";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournamentData } from "@/hooks/useTournamentData";
import { cn } from "@/lib/utils";

type Tab = "matches" | "standings" | "mvp";

type PlayerAgg = {
  player_id: string;
  nickname: string;
  avatar: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  mvp: number;
  adr: number;
};

type TournamentMatches = NonNullable<
  ReturnType<typeof useTournamentData>["data"]
>;

function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-red-400 text-xs">
      <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
      LIVE
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-16 text-center">
      <IconTrophy size={32} className="text-yellow-400/60" />
      <div>
        <p className="font-bold text-neutral-300 text-sm">
          Tournament starts soon
        </p>
        <p className="mt-1 text-neutral-500 text-sm">
          14 March · 13:00 <span className="text-neutral-600">GMT+1</span>
        </p>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: TournamentMatches[number] }) {
  const isLive = match.status === "ONGOING";
  const isFinished = match.status === "FINISHED";
  const t1 = match.teams[0];
  const t2 = match.teams[1];
  const map = match.map_pick?.replace("de_", "");

  const score1 = t1?.final_score ?? "—";
  const score2 = t2?.final_score ?? "—";
  const t1Win = t1?.team_win;
  const t2Win = t2?.team_win;

  return (
    <Link href={`/tournament/match/${match.id}`} className="block">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-neutral-950 transition-colors hover:bg-neutral-900/50",
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
                {format(new Date(match.started_at), "HH:mm")}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={t1?.avatar ?? undefined} />
              <AvatarFallback className="rounded-lg text-xs">
                {t1?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn("truncate font-medium text-sm", {
                "text-emerald-400": isFinished && t1Win === true,
                "text-red-400": isFinished && t1Win === false,
                "text-white": !isFinished,
                "text-neutral-500": isFinished && t1Win === false,
              })}
            >
              {t1?.name}
            </span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span
              className={cn("font-black font-mono text-2xl tabular-nums", {
                "text-emerald-400": isFinished && t1Win === true,
                "text-red-400": isFinished && t1Win === false,
                "text-neutral-400": !isFinished,
              })}
            >
              {score1}
            </span>
            <span className="font-mono text-neutral-700 text-sm">:</span>
            <span
              className={cn("font-black font-mono text-2xl tabular-nums", {
                "text-emerald-400": isFinished && t2Win === true,
                "text-red-400": isFinished && t2Win === false,
                "text-neutral-400": !isFinished,
              })}
            >
              {score2}
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span
              className={cn("truncate text-right font-medium text-sm", {
                "text-emerald-400": isFinished && t2Win === true,
                "text-red-400": isFinished && t2Win === false,
                "text-white": !isFinished,
                "text-neutral-500": isFinished && t2Win === false,
              })}
            >
              {t2?.name}
            </span>
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={t2?.avatar ?? undefined} />
              <AvatarFallback className="rounded-lg text-xs">
                {t2?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MatchesTab({ matches }: { matches: TournamentMatches }) {
  const live = matches.filter((m) => m.status === "ONGOING");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");

  if (!live.length && !scheduled.length && !finished.length)
    return <EmptyState />;

  return (
    <div className="flex flex-col gap-6">
      {live.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            🔴 Live ({live.length})
          </h2>
          {live.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
      {scheduled.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            Upcoming ({scheduled.length})
          </h2>
          {scheduled.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
      {finished.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            Finished ({finished.length})
          </h2>
          {finished.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function StandingsTab({ matches }: { matches: TournamentMatches }) {
  const finished = matches.filter((m) => m.status === "FINISHED");
  const teams: Record<
    string,
    { name: string; avatar: string; team_id: string; w: number; l: number }
  > = {};

  for (const match of finished) {
    for (const t of match.teams) {
      if (!teams[t.team_id]) {
        teams[t.team_id] = {
          name: t.name,
          avatar: t.avatar ?? "",
          team_id: t.team_id,
          w: 0,
          l: 0,
        };
      }
      if (t.team_win === true) teams[t.team_id].w++;
      else if (t.team_win === false) teams[t.team_id].l++;
    }
  }

  const sorted = orderBy(Object.values(teams), ["w", "l"], ["desc", "asc"]);
  if (!sorted.length) return <EmptyState />;

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
              key={team.team_id}
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
                  <Link
                    href={`/tournament/team/${team.team_id}`}
                    className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                  >
                    {team.name}
                  </Link>
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

function MVPTab({ matches }: { matches: TournamentMatches }) {
  const players: Record<string, PlayerAgg> = {};

  const avatarMap: Record<string, string> = {};
  for (const match of matches.filter((m) => m.status === "FINISHED")) {
    for (const team of match.teams) {
      for (const p of team.players) {
        if (p.player_id_nullable) avatarMap[p.player_id_nullable] = "";
      }
    }
  }

  for (const match of matches.filter((m) => m.status === "FINISHED")) {
    for (const team of match.teams) {
      for (const p of team.players) {
        const pid = p.player_id_nullable ?? p.player_id_mandatory;
        if (!players[pid]) {
          players[pid] = {
            player_id: pid,
            nickname: p.nickname,
            avatar: avatarMap[pid] ?? "",
            matches: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            mvp: 0,
            adr: 0,
          };
        }
        players[pid].matches++;
        players[pid].kills += p.kills ?? 0;
        players[pid].deaths += p.deaths ?? 0;
        players[pid].assists += p.assists ?? 0;
        players[pid].headshots += p.headshots ?? 0;
        players[pid].mvp += p.mvps ?? 0;
        players[pid].adr += p.adr ?? 0;
      }
    }
  }

  const sorted = orderBy(
    Object.values(players),
    [(p) => p.kills / Math.max(p.deaths, 1)],
    ["desc"],
  );

  if (!sorted.length) return <EmptyState />;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="border-neutral-800 border-b px-5 py-4">
        <h3 className="font-bold text-white">Player Statistics</h3>
        <p className="text-neutral-500 text-sm">Sorted by KD</p>
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
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-neutral-800/50 border-b">
              {[
                "#",
                "Player",
                "M",
                "MVP",
                "Avg K",
                "Avg D",
                "KD",
                "+/-",
                "HS%",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                    i <= 1 ? "text-left" : "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const avgK = p.kills / Math.max(p.matches, 1);
              const avgD = p.deaths / Math.max(p.matches, 1);
              const kd = p.kills / Math.max(p.deaths, 1);
              const kdDiff = p.kills - p.deaths;
              const hs = (p.headshots / Math.max(p.kills, 1)) * 100;

              return (
                <tr
                  key={p.player_id}
                  className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                >
                  <td className="px-4 py-2.5 font-mono text-neutral-600 text-sm">
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 rounded-md">
                        <AvatarFallback className="rounded-md text-xs">
                          {p.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/tournament/player/${p.player_id}`}
                        className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                      >
                        {p.nickname}
                      </Link>
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
                      {p.mvp > 0 ? p.mvp : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-200 text-sm">
                    {avgK.toFixed(0)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {avgD.toFixed(0)}
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
                  <td className="px-4 py-2.5 text-right font-mono text-sm tabular-nums">
                    <span
                      className={cn(
                        kdDiff >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {kdDiff >= 0 ? `+${kdDiff}` : kdDiff}
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
    data: matches = [],
    isLoading,
    refetch,
    isFetching,
  } = useTournamentData();

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 font-black text-2xl text-white">
            <IconTrophy size={24} className="text-yellow-400" />
            ESDUA Tournament
          </h1>
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
            {activeTab === "mvp" && <MVPTab matches={matches} />}
          </>
        )}
      </div>
    </div>
  );
}
