"use client";

import { IconArrowLeft, IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "cn";
import { format } from "date-fns";
import { orderBy, sumBy } from "es-toolkit";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/section-header";
import {
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEventData } from "@/features/events/hooks/use-event-data";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";

function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-52 rounded-2xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-card px-4 py-3">
      <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
        {label}
      </span>
      <span
        className={cn("font-bold font-mono text-xl tabular-nums", className)}
      >
        {value}
      </span>
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
            team_name: teamInfo
              ? normalizeTeamName(teamInfo.team_name)
              : ps.faction_id,
            is_winner: teamStat?.is_winner,
          },
        ];
      }),
    ),
    [(r) => r.started_at ?? "", (r) => r.match_round],
    ["desc", "asc"],
  );

  if (!mapRows.length) return notFound();

  const nickname = mapRows[0]?.nickname ?? decodeURIComponent(playerId);
  const team = mapRows[0]?.team_name;
  const mapsPlayed = mapRows.length;
  const mapsWon = mapRows.filter((r) => r.is_winner === true).length;
  const totalKills = sumBy(mapRows, (r) => r.kills);
  const totalDeaths = sumBy(mapRows, (r) => r.deaths);
  const totalHeadshots = sumBy(mapRows, (r) => r.headshots);
  const totalAdr = sumBy(mapRows, (r) => r.adr ?? 0);
  const totalMvps = sumBy(mapRows, (r) => r.mvps);

  const kd = totalKills / Math.max(totalDeaths, 1);
  const winRate = (mapsWon / mapsPlayed) * 100;

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-border border-b px-4 py-3 sm:px-6">
          <Link
            href={`/events/${slug}/players`}
            className="inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            All players
          </Link>
          <Link
            href={`/player/${playerId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Full profile
            <IconArrowUpRight />
          </Link>
        </div>

        <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
          <Avatar className="size-14 rounded-xl after:rounded-xl">
            <AvatarFallback className="rounded-xl font-bold text-lg">
              {nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <h2 className="truncate font-black text-2xl tracking-tight">
              {nickname}
            </h2>
            <p className="truncate text-muted-foreground text-sm">
              {team} · {mapsPlayed} maps
            </p>
          </div>
          {totalMvps > 0 && (
            <div className="ml-auto flex flex-col items-end">
              <span className="font-black font-mono text-3xl text-warning tabular-nums">
                {totalMvps}
              </span>
              <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
                MVPs
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-px border-border border-t bg-border sm:grid-cols-3 lg:grid-cols-6">
          <Stat
            label="K/D"
            value={kd.toFixed(2)}
            className={cn(
              ratioTone(kd) === "win" && "text-win",
              ratioTone(kd) === "loss" && "text-loss",
            )}
          />
          <Stat
            label="Avg kills"
            value={(totalKills / mapsPlayed).toFixed(1)}
          />
          <Stat
            label="Avg deaths"
            value={(totalDeaths / mapsPlayed).toFixed(1)}
          />
          <Stat label="ADR" value={(totalAdr / mapsPlayed).toFixed(1)} />
          <Stat
            label="HS%"
            value={`${((totalHeadshots / Math.max(totalKills, 1)) * 100).toFixed(0)}%`}
          />
          <Stat
            label="Maps won"
            value={`${winRate.toFixed(0)}%`}
            className={cn(winRate >= 50 ? "text-win" : "text-loss")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Maps"
          description="Every map played at this event"
        />
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
          <StatsTable minWidth={640}>
            <thead className="border-border border-b">
              <tr>
                <StatsTh sticky align="left">
                  Map
                </StatsTh>
                <StatsTh align="left">Date</StatsTh>
                <StatsTh>K</StatsTh>
                <StatsTh>D</StatsTh>
                <StatsTh>A</StatsTh>
                <StatsTh>K/D</StatsTh>
                <StatsTh>ADR</StatsTh>
                <StatsTh>HS%</StatsTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mapRows.map((row) => (
                <tr
                  key={`${row.match_id}-${row.match_round}`}
                  className="transition-colors hover:bg-foreground/3"
                >
                  <StatsTd
                    sticky
                    align="left"
                    numeric={false}
                    className={cn(
                      "border-l-2",
                      row.is_winner === true && "border-l-win",
                      row.is_winner === false && "border-l-loss",
                      row.is_winner == null && "border-l-transparent",
                    )}
                  >
                    <Link
                      href={`/events/${slug}/matches/${row.match_id}`}
                      className="font-medium capitalize transition-colors hover:text-primary"
                    >
                      {row.map_name?.replace("de_", "")}
                    </Link>
                  </StatsTd>
                  <StatsTd align="left" tone="muted" numeric={false}>
                    {row.started_at && format(row.started_at, "d MMM, HH:mm")}
                  </StatsTd>
                  <StatsTd tone="strong">{row.kills}</StatsTd>
                  <StatsTd>{row.deaths}</StatsTd>
                  <StatsTd>{row.assists}</StatsTd>
                  <StatsTd tone={ratioTone(row.kd)}>
                    {row.kd.toFixed(2)}
                  </StatsTd>
                  <StatsTd>{row.adr?.toFixed(1)}</StatsTd>
                  <StatsTd>{row.hs_pct.toFixed(0)}%</StatsTd>
                </tr>
              ))}
            </tbody>
          </StatsTable>
        </div>
      </section>
    </div>
  );
}
