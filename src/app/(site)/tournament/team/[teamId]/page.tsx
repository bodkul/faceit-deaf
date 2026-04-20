"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournamentData } from "@/hooks/useTournamentData";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ teamId: string }> };

export default function TournamentTeamPage(props: PageProps) {
  const { teamId } = use(props.params);
  const teamName = decodeURIComponent(teamId);

  const { data: matches = [], isLoading } = useTournamentData();

  if (isLoading)
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
        <Skeleton className="h-8 w-32 bg-neutral-900" />
        <Skeleton className="h-24 w-full rounded-2xl bg-neutral-900" />
        <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
      </div>
    );

  const teamMatches = matches.filter(
    (m) => m.status === "FINISHED" && m.teams.some((t) => t.name === teamName),
  );

  if (!teamMatches.length) return notFound();

  const teamData = teamMatches[0].teams.find((t) => t.name === teamName);
  if (!teamData) return notFound();
  let wins = 0;

  const playerStats: Record<
    string,
    {
      nickname: string;
      player_id: string;
      kills: number;
      deaths: number;
      assists: number;
      headshots: number;
      adr: number;
      matches: number;
    }
  > = {};

  type MatchHistoryRow = {
    matchId: string;
    map: string;
    win: boolean;
    score1: string;
    score2: string;
    enemyName: string;
    enemyAvatar: string;
  };

  const history: MatchHistoryRow[] = [];

  for (const match of teamMatches) {
    const myTeam = match.teams.find((t) => t.name === teamName);
    const enemyTeam = match.teams.find((t) => t.name !== teamName);
    if (!myTeam) continue;

    const win = myTeam.team_win === true;
    if (win) wins++;

    history.push({
      matchId: match.id,
      map: match.map_pick?.replace("de_", "") ?? "—",
      win,
      score1: String(myTeam.final_score ?? "—"),
      score2: String(enemyTeam?.final_score ?? "—"),
      enemyName: enemyTeam?.name ?? "—",
      enemyAvatar: enemyTeam?.avatar ?? "",
    });

    for (const p of myTeam.players) {
      const pid = p.player_id_nullable ?? p.player_id_mandatory;
      if (!playerStats[pid]) {
        playerStats[pid] = {
          nickname: p.nickname,
          player_id: pid,
          kills: 0,
          deaths: 0,
          assists: 0,
          headshots: 0,
          adr: 0,
          matches: 0,
        };
      }
      playerStats[pid].kills += p.kills ?? 0;
      playerStats[pid].deaths += p.deaths ?? 0;
      playerStats[pid].assists += p.assists ?? 0;
      playerStats[pid].headshots += p.headshots ?? 0;
      playerStats[pid].adr += p.adr ?? 0;
      playerStats[pid].matches++;
    }
  }

  const n = teamMatches.length;
  const players = Object.values(playerStats);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href="/tournament">
          <IconArrowLeft size={14} className="mr-1" />
          Tournament
        </Link>
      </Button>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-14 rounded-xl">
            <AvatarImage src={teamData.avatar ?? undefined} />
            <AvatarFallback className="rounded-xl text-lg">
              {teamData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-black text-2xl text-white">{teamData.name}</h1>
            <p className="text-neutral-500 text-sm">{n} matches</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
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
                {n - wins}
              </div>
              <div className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                L
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="border-neutral-800 border-b px-5 py-4">
          <h3 className="font-bold text-white">Players</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-max min-w-full">
            <colgroup>
              <col className="w-44" />
              <col className="w-14" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-20" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-neutral-800/50 border-b">
                {[
                  "Player",
                  "Matches",
                  "Avg Kills",
                  "Avg Deaths",
                  "KD",
                  "ADR",
                ].map((h, i) => (
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
                const avgK = p.kills / Math.max(p.matches, 1);
                const avgD = p.deaths / Math.max(p.matches, 1);
                const kd = p.kills / Math.max(p.deaths, 1);
                const adr = p.adr / Math.max(p.matches, 1);
                return (
                  <tr
                    key={p.player_id}
                    className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/tournament/player/${p.player_id}`}
                        className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                      >
                        {p.nickname}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {p.matches}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-200 text-sm">
                      {avgK.toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {avgD.toFixed(0)}
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
                      {adr.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="border-neutral-800 border-b px-5 py-4">
          <h3 className="font-bold text-white">Match History</h3>
        </div>
        <div className="flex flex-col">
          {history.map((row) => (
            <Link
              key={row.matchId}
              href={`/tournament/match/${row.matchId}`}
              className={cn(
                "flex items-center gap-4 border-neutral-800/50 border-b border-l-2 px-4 py-3 transition-colors last:border-0 hover:bg-neutral-800/20",
                row.win ? "border-l-emerald-500/40" : "border-l-red-500/40",
              )}
            >
              <div
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  row.win ? "bg-emerald-400" : "bg-red-400",
                )}
              />
              <span className="w-20 font-mono text-neutral-300 text-sm capitalize">
                {row.map}
              </span>
              <div className="flex flex-1 items-center gap-2">
                <Avatar className="size-5 rounded-md">
                  <AvatarImage src={row.enemyAvatar} />
                  <AvatarFallback className="rounded-md text-xs">
                    {row.enemyName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-neutral-500 text-sm">
                  vs {row.enemyName}
                </span>
              </div>
              <span className="font-mono text-sm tabular-nums">
                <span className={row.win ? "text-emerald-400" : "text-red-400"}>
                  {row.score1}
                </span>
                <span className="text-neutral-700"> : </span>
                <span
                  className={!row.win ? "text-emerald-400" : "text-red-400"}
                >
                  {row.score2}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
