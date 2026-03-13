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
    (m) =>
      m.status === "FINISHED" &&
      (m.teams.faction1.faction_id === teamId ||
        m.teams.faction2.faction_id === teamId),
  );

  if (!teamMatches.length) return notFound();

  const firstMatch = teamMatches[0];
  const teamData =
    firstMatch.teams.faction1.faction_id === teamId
      ? firstMatch.teams.faction1
      : firstMatch.teams.faction2;

  let wins = 0;
  const playerStats: Record<
    string,
    {
      nickname: string;
      avatar: string;
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
    const isF1 = match.teams.faction1.faction_id === teamId;
    const myFaction = isF1 ? match.teams.faction1 : match.teams.faction2;
    const enemyFaction = isF1 ? match.teams.faction2 : match.teams.faction1;
    const win = match.results?.winner === (isF1 ? "faction1" : "faction2");
    if (win) wins++;

    const round = match.matchStats?.rounds?.[0];
    const myTeam = round?.teams.find((t) => t.team_id === teamId);
    const enemyTeam = round?.teams.find((t) => t.team_id !== teamId);

    history.push({
      matchId: match.match_id,
      map: match.voting?.map?.pick?.[0]?.replace("de_", "") ?? "—",
      win,
      score1: myTeam ? String(myTeam.team_stats["Final Score"]) : "—",
      score2: enemyTeam ? String(enemyTeam.team_stats["Final Score"]) : "—",
      enemyName: enemyFaction.name,
      enemyAvatar: enemyFaction.avatar,
    });

    // player stats
    if (myTeam) {
      for (const p of myTeam.players) {
        if (!playerStats[p.player_id]) {
          const rosterP = myFaction.roster.find(
            (r) => r.player_id === p.player_id,
          );
          playerStats[p.player_id] = {
            nickname: p.nickname,
            player_id: p.player_id,
            avatar: rosterP?.avatar ?? "",
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            adr: 0,
            matches: 0,
          };
        }
        const s = p.player_stats as unknown as Record<string, string>;
        playerStats[p.player_id].kills += Number(s.Kills);
        playerStats[p.player_id].deaths += Number(s.Deaths);
        playerStats[p.player_id].assists += Number(s.Assists);
        playerStats[p.player_id].headshots += Number(s.Headshots);
        playerStats[p.player_id].adr += Number(s.ADR);
        playerStats[p.player_id].matches++;
      }
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

      {/* team header */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-14 rounded-xl">
            <AvatarImage src={teamData.avatar} />
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

      {/* players */}
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
                {["Player", "M", "Avg K", "Avg D", "KD", "ADR"].map((h, i) => (
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
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6 rounded-md">
                          <AvatarImage src={p.avatar} />
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
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-200 text-sm">
                      {avgK.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                      {avgD.toFixed(1)}
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

      {/* match history */}
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
                "flex items-center gap-4 border-neutral-800/50 border-b px-4 py-3 transition-colors last:border-0 hover:bg-neutral-800/20",
                "border-l-2",
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
