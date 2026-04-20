"use client";

import {
  IconArrowLeft,
  IconExternalLink,
  IconMapPin,
} from "@tabler/icons-react";
import { format } from "date-fns";
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

  const match = matches.find((m) => m.id === matchId);
  if (!match) return notFound();

  const t1 = match.teams[0];
  const t2 = match.teams[1];

  const score1 = t1?.final_score ?? "—";
  const score2 = t2?.final_score ?? "—";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <Button variant="dark" size="sm" asChild className="w-fit">
        <Link href="/tournament">
          <IconArrowLeft size={14} className="mr-1" />
          Tournament
        </Link>
      </Button>

      {/* header */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        {match.map_pick && (
          <div className="absolute inset-0">
            <Image
              src={`/img/maps/${match.map_pick}.webp`}
              alt={match.map_pick}
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
                {match.map_pick?.replace("de_", "") ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {match.started_at && (
                <span className="font-mono text-neutral-600 text-xs">
                  {format(new Date(match.started_at), "HH:mm · dd/MM/yyyy")}
                </span>
              )}
              <Button variant="dark" size="sm" asChild>
                <Link
                  href={`https://www.faceit.com/en/cs2/room/1-${matchId}`}
                  target="_blank"
                >
                  FACEIT <IconExternalLink size={12} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 rounded-xl">
                <AvatarImage src={t1?.avatar ?? undefined} />
                <AvatarFallback className="rounded-xl">
                  {t1?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Link
                href={`/tournament/team/${encodeURIComponent(t1.name)}`}
                className="font-bold text-white transition-colors hover:text-neutral-300"
              >
                {t1?.name}
              </Link>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": t1?.team_win === true,
                    "text-red-400": t1?.team_win === false,
                    "text-neutral-400": t1?.team_win == null,
                  })}
                >
                  {score1}
                </span>
                <span className="font-mono text-neutral-700">:</span>
                <span
                  className={cn("font-black font-mono text-4xl tabular-nums", {
                    "text-emerald-400": t2?.team_win === true,
                    "text-red-400": t2?.team_win === false,
                    "text-neutral-400": t2?.team_win == null,
                  })}
                >
                  {score2}
                </span>
              </div>
              {(t1?.first_half_score != null ||
                t1?.second_half_score != null) && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      1H
                    </span>
                    <span className="text-neutral-400">
                      {t1?.first_half_score ?? "—"} :{" "}
                      {t2?.first_half_score ?? "—"}
                    </span>
                  </div>
                  <span className="text-neutral-800">·</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-neutral-600 uppercase tracking-widest">
                      2H
                    </span>
                    <span className="text-neutral-400">
                      {t1?.second_half_score ?? "—"} :{" "}
                      {t2?.second_half_score ?? "—"}
                    </span>
                  </div>
                  {t1?.overtime_score != null && t1.overtime_score > 0 && (
                    <>
                      <span className="text-neutral-800">·</span>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-neutral-600 uppercase tracking-widest">
                          OT
                        </span>
                        <span className="text-yellow-500/80">
                          {t1.overtime_score} : {t2?.overtime_score}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href={`/tournament/team/${encodeURIComponent(t2.name)}`}
                className="font-bold text-white transition-colors hover:text-neutral-300"
              >
                {t2?.name}
              </Link>
              <Avatar className="size-12 rounded-xl">
                <AvatarImage src={t2?.avatar ?? undefined} />
                <AvatarFallback className="rounded-xl">
                  {t2?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* player stats */}
      {match.teams.map((team) => (
        <div
          key={team.id}
          className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
        >
          <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
            <Avatar className="size-7 rounded-lg">
              <AvatarImage src={team.avatar ?? undefined} />
              <AvatarFallback className="rounded-lg text-xs">
                {team.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-white">
              {team.name}
            </span>
            <span
              className={cn("ml-auto font-bold font-mono text-sm", {
                "text-emerald-400": team.team_win === true,
                "text-red-400": team.team_win === false,
                "text-neutral-400": team.team_win == null,
              })}
            >
              {team.team_win === true
                ? "WIN"
                : team.team_win === false
                  ? "LOSS"
                  : null}
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
                {team.players
                  .slice()
                  .sort((a, b) => (b.kills ?? 0) - (a.kills ?? 0))
                  .map((p) => {
                    const k = p.kills ?? 0;
                    const d = p.deaths ?? 0;
                    const kd = k / Math.max(d, 1);
                    const hs = ((p.headshots ?? 0) / Math.max(k, 1)) * 100;
                    const pid = p.player_id_nullable ?? p.player_id_mandatory;
                    return (
                      <tr
                        key={p.id}
                        className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                      >
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/tournament/player/${pid}`}
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
      ))}
    </div>
  );
}
