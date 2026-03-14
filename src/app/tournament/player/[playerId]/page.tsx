"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournamentData } from "@/hooks/useTournamentData";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ playerId: string }> };

export default function TournamentPlayerPage(props: PageProps) {
  const { playerId } = use(props.params);
  const { data: matches = [], isLoading } = useTournamentData();

  if (isLoading)
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
        <Skeleton className="h-8 w-32 bg-neutral-900" />
        <Skeleton className="h-24 w-full rounded-2xl bg-neutral-900" />
        <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
      </div>
    );

  const playerMatches = matches.filter(
    (m) =>
      m.status === "FINISHED" &&
      m.teams.some((t) =>
        t.players.some(
          (p) =>
            p.player_id_nullable === playerId ||
            p.player_id_mandatory === playerId,
        ),
      ),
  );

  if (!playerMatches.length) return notFound();

  const firstPlayer = playerMatches[0].teams
    .flatMap((t) => t.players)
    .find(
      (p) =>
        p.player_id_nullable === playerId || p.player_id_mandatory === playerId,
    );

  const nickname = firstPlayer?.nickname ?? playerId;

  let totalKills = 0,
    totalDeaths = 0,
    totalHeadshots = 0,
    totalAdr = 0,
    totalMvp = 0;
  let wins = 0,
    statMatches = 0;

  type MatchRow = {
    matchId: string;
    map: string;
    kills: number;
    deaths: number;
    assists: number;
    adr: number;
    kd: number;
    hs: number;
    win: boolean;
    score1: string;
    score2: string;
    enemyTeamName: string;
  };

  const matchRows: MatchRow[] = [];

  for (const match of playerMatches) {
    const myTeam = match.teams.find((t) =>
      t.players.some(
        (p) =>
          p.player_id_nullable === playerId ||
          p.player_id_mandatory === playerId,
      ),
    );
    const enemyTeam = match.teams.find(
      (t) =>
        !t.players.some(
          (p) =>
            p.player_id_nullable === playerId ||
            p.player_id_mandatory === playerId,
        ),
    );
    const win = myTeam?.team_win === true;
    if (win) wins++;

    const playerStat = myTeam?.players.find(
      (p) =>
        p.player_id_nullable === playerId || p.player_id_mandatory === playerId,
    );

    if (playerStat) {
      const k = playerStat.kills ?? 0;
      const d = playerStat.deaths ?? 0;
      const hs = playerStat.headshots ?? 0;
      const adr = playerStat.adr ?? 0;

      totalKills += k;
      totalDeaths += d;
      totalHeadshots += hs;
      totalAdr += adr;
      totalMvp += playerStat.mvps ?? 0;
      statMatches++;

      matchRows.push({
        matchId: match.id,
        map: match.map_pick?.replace("de_", "") ?? "—",
        kills: k,
        deaths: d,
        assists: playerStat.assists ?? 0,
        adr,
        kd: k / Math.max(d, 1),
        hs: (hs / Math.max(k, 1)) * 100,
        win,
        score1: String(myTeam?.final_score ?? "—"),
        score2: String(enemyTeam?.final_score ?? "—"),
        enemyTeamName: enemyTeam?.name ?? "—",
      });
    }
  }

  const avgK = totalKills / Math.max(statMatches, 1);
  const avgD = totalDeaths / Math.max(statMatches, 1);
  const kd = totalKills / Math.max(totalDeaths, 1);
  const wr = (wins / Math.max(playerMatches.length, 1)) * 100;
  const avgAdr = totalAdr / Math.max(statMatches, 1);
  const hsPercent = (totalHeadshots / Math.max(totalKills, 1)) * 100;

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
            <AvatarFallback className="rounded-xl text-lg">
              {nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-black text-2xl text-white">{nickname}</h1>
            <p className="text-neutral-500 text-sm">
              {statMatches} matches · {wins}W {statMatches - wins}L
            </p>
          </div>
          <div className="ml-auto text-right">
            <div className="font-bold font-mono text-3xl text-yellow-400">
              {totalMvp}
            </div>
            <div className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
              MVPs
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-neutral-800 border-t sm:grid-cols-5">
          {[
            {
              label: "KD",
              value: kd.toFixed(2),
              color: kd >= 1 ? "text-emerald-400" : "text-red-400",
            },
            {
              label: "Avg K",
              value: avgK.toFixed(1),
              color: "text-neutral-200",
            },
            {
              label: "Avg D",
              value: avgD.toFixed(1),
              color: "text-neutral-400",
            },
            {
              label: "ADR",
              value: avgAdr.toFixed(1),
              color: "text-neutral-200",
            },
            {
              label: "HS%",
              value: `${hsPercent.toFixed(1)}%`,
              color: "text-neutral-400",
            },
            {
              label: "Win Rate",
              value: `${wr.toFixed(0)}%`,
              color: wr >= 50 ? "text-emerald-400" : "text-red-400",
            },
          ].map(({ label, value, color }) => (
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
          <h3 className="font-bold text-white">Match History</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-max min-w-full">
            <colgroup>
              <col className="w-6" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-14" />
              <col className="w-16" />
              <col className="w-16" />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-neutral-800/50 border-b">
                {["result", "Map", "vs", "K", "D", "A", "KD", "ADR", "HS%"].map(
                  (h) => (
                    <th
                      key={h}
                      className={cn(
                        "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                        ["result", "Map", "vs"].includes(h)
                          ? "text-left"
                          : "text-right",
                      )}
                    >
                      {h === "result" ? "" : h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {matchRows.map((row) => (
                <tr
                  key={row.matchId}
                  className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                >
                  <td className="px-4 py-2.5">
                    <div
                      className={cn(
                        "size-1.5 rounded-full",
                        row.win ? "bg-emerald-400" : "bg-red-400",
                      )}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/tournament/match/${row.matchId}`}
                      className="font-mono text-neutral-300 text-sm capitalize transition-colors hover:text-white"
                    >
                      {row.map}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs tabular-nums">
                        <span
                          className={
                            row.win ? "text-emerald-400" : "text-red-400"
                          }
                        >
                          {row.score1}
                        </span>
                        <span className="text-neutral-700"> : </span>
                        <span
                          className={
                            !row.win ? "text-emerald-400" : "text-red-400"
                          }
                        >
                          {row.score2}
                        </span>
                      </span>
                      <span className="max-w-20 truncate text-neutral-500 text-xs">
                        {row.enemyTeamName}
                      </span>
                    </div>
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
                    {row.adr.toFixed(1)}
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
