"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconMapPin,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournamentData } from "@/hooks/useTournamentData";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ matchId: string }> };

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-40 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-64 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

export default function TournamentMatchPage(props: PageProps) {
  const { matchId } = use(props.params);
  const { data: matches = [], isLoading } = useTournamentData();

  if (isLoading) return <Loading />;

  const match = matches.find((m) => m.match_id === matchId);
  if (!match) return notFound();

  const f1 = match.teams.faction1;
  const f2 = match.teams.faction2;
  const winner = match.results?.winner;
  const map = match.voting?.map?.pick?.[0]?.replace("de_", "");
  const round = match.matchStats?.rounds?.[0];

  const t1 = round?.teams.find((t) => t.team_id === f1.faction_id);
  const t2 = round?.teams.find((t) => t.team_id === f2.faction_id);

  const score1 = t1
    ? String(t1.team_stats["Final Score"])
    : (match.results?.score?.faction1 ?? "—");
  const score2 = t2
    ? String(t2.team_stats["Final Score"])
    : (match.results?.score?.faction2 ?? "—");

  const half1_1 = t1 ? String(t1.team_stats["First Half Score"]) : null;
  const half1_2 = t2 ? String(t2.team_stats["First Half Score"]) : null;
  const half2_1 = t1 ? String(t1.team_stats["Second Half Score"]) : null;
  const half2_2 = t2 ? String(t2.team_stats["Second Half Score"]) : null;
  const ot1 = t1 ? Number(t1.team_stats["Overtime score"]) : 0;
  const ot2 = t2 ? Number(t2.team_stats["Overtime score"]) : 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <Button variant="dark" size="sm" asChild>
          <Link href="/tournament">
            <IconArrowLeft size={14} className="mr-1" />
            Tournament
          </Link>
        </Button>
      </div>

      {/* header */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        {map && (
          <div className="absolute inset-0">
            <Image
              src={`/img/maps/${map}.webp`}
              alt={map}
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-linear-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-600/50 to-transparent" />

        <div className="relative px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5">
              <IconMapPin size={12} className="text-neutral-500" />
              <span className="font-mono text-neutral-300 text-xs capitalize">
                {map ?? "—"}
              </span>
            </div>
            <Button variant="dark" size="sm" asChild>
              <Link
                href={`https://www.faceit.com/en/cs2/room/1-${matchId}`}
                target="_blank"
              >
                FACEIT <IconExternalLink size={12} className="ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 rounded-xl">
                <AvatarImage src={f1.avatar} />
                <AvatarFallback className="rounded-xl">
                  {f1.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/tournament/team/${f1.faction_id}`}
                  className="font-bold text-white transition-colors hover:text-neutral-300"
                >
                  {f1.name}
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": winner === "faction1",
                    "text-red-400": winner === "faction2",
                    "text-neutral-400": !winner,
                  })}
                >
                  {score1}
                </span>
                <span className="font-mono text-neutral-700">:</span>
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": winner === "faction2",
                    "text-red-400": winner === "faction1",
                    "text-neutral-400": !winner,
                  })}
                >
                  {score2}
                </span>
              </div>

              {half1_1 && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      1H
                    </span>
                    <span className="text-neutral-400">
                      {half1_1} : {half1_2}
                    </span>
                  </div>
                  <span className="text-neutral-800">·</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      2H
                    </span>
                    <span className="text-neutral-400">
                      {half2_1} : {half2_2}
                    </span>
                  </div>
                  {ot1 > 0 && (
                    <>
                      <span className="text-neutral-800">·</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-neutral-600 uppercase tracking-widest">
                          OT
                        </span>
                        <span className="text-yellow-500/80">
                          {ot1} : {ot2}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <div className="text-right">
                <Link
                  href={`/tournament/team/${f2.faction_id}`}
                  className="font-bold text-white transition-colors hover:text-neutral-300"
                >
                  {f2.name}
                </Link>
              </div>
              <Avatar className="size-12 rounded-xl">
                <AvatarImage src={f2.avatar} />
                <AvatarFallback className="rounded-xl">
                  {f2.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* player stats */}
      {round &&
        [
          { faction: f1, team: t1, factionKey: "faction1" },
          { faction: f2, team: t2, factionKey: "faction2" },
        ].map(({ faction, team, factionKey }) => (
          <div
            key={factionKey}
            className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
          >
            <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
              <Avatar className="size-7 rounded-lg">
                <AvatarImage src={faction.avatar} />
                <AvatarFallback className="rounded-lg text-xs">
                  {faction.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm text-white">
                {faction.name}
              </span>
              <span
                className={cn("ml-auto font-bold font-mono text-sm", {
                  "text-emerald-400": winner === factionKey,
                  "text-red-400": winner !== factionKey && winner,
                  "text-neutral-400": !winner,
                })}
              >
                {winner === factionKey ? "WIN" : winner ? "LOSS" : null}
              </span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-max min-w-full">
                <colgroup>
                  <col className="w-48" />
                  <col className="w-14" />
                  <col className="w-14" />
                  <col className="w-14" />
                  <col className="w-16" />
                  <col className="w-16" />
                  <col className="w-20" />
                </colgroup>
                <thead>
                  <tr className="border-neutral-800/50 border-b">
                    {["Player", "K", "D", "A", "KD", "ADR", "HS%"].map(
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
                  {team?.players.map((p) => {
                    const s = p.player_stats as unknown as Record<
                      string,
                      string
                    >;
                    const kd = Number(s.Kills) / Math.max(Number(s.Deaths), 1);
                    const hs =
                      (Number(s.Headshots) / Math.max(Number(s.Kills), 1)) *
                      100;
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
                        <td className="px-4 py-2.5 text-right font-mono text-neutral-300 text-sm">
                          {s.Kills}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                          {s.Deaths}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                          {s.Assists}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-sm">
                          <span
                            className={cn(
                              kd >= 1 ? "text-emerald-400" : "text-red-400",
                            )}
                          >
                            {kd.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                          {Number(s.ADR).toFixed(1)}
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
        ))}
    </div>
  );
}
