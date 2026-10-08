import { IconArrowRight, IconTrophy } from "@tabler/icons-react";
import { cn } from "cn";
import { range } from "es-toolkit/math";
import Link from "next/link";

import {
  type CellTone,
  cellToneClass,
  ratioTone,
} from "@/components/stats-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEventDates } from "@/features/events/lib/event-status";
import type { PlayerEvent } from "@/features/player/events-queries";
import { teamHref } from "@/features/teams/lib/team-href";

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: CellTone | null;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-card px-4 py-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span
        className={cn(
          "font-bold font-mono tabular-nums",
          tone ? cellToneClass[tone] : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-(--highlight)">
      <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
        {label}
      </span>
      <span className="font-black font-mono text-2xl tabular-nums">
        {children}
      </span>
    </div>
  );
}

function EventCard({
  event,
  playerId,
}: {
  event: PlayerEvent;
  playerId: string;
}) {
  const kd = event.kills / Math.max(event.deaths, 1);
  const hs = event.kills
    ? Math.round((event.headshots / event.kills) * 100)
    : 0;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <div className="flex items-center gap-4 p-4">
        <Avatar className="size-12 shrink-0 rounded-lg after:rounded-lg after:border-border">
          <AvatarImage
            className="rounded-lg bg-black object-contain"
            src={event.logo_url}
            alt=""
          />
          <AvatarFallback className="rounded-lg font-bold">
            {event.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/events/${event.slug}/matches`}
            className="line-clamp-2 font-semibold transition-colors hover:text-primary"
          >
            {event.name}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
            <span>{formatEventDates(event.start_date, event.end_date)}</span>
            {event.teams.map((team) => (
              <Link
                key={team}
                href={teamHref(team)}
                className="rounded-md bg-foreground/6 px-1.5 py-0.5 font-medium text-foreground text-xs ring-1 ring-foreground/10 ring-inset transition-colors hover:bg-foreground/10"
              >
                {team}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <span className="font-black font-mono text-xl tabular-nums">
            <span className="text-win">{event.wins}</span>
            <span className="text-faint">–</span>
            <span className="text-loss">{event.losses}</span>
          </span>
          <span className="text-faint text-xs">series</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px border-border border-t bg-border sm:grid-cols-6">
        <Metric label="Maps" value={event.maps} tone="muted" />
        <Metric label="K/D" value={kd.toFixed(2)} tone={ratioTone(kd)} />
        <Metric label="Avg K" value={(event.kills / event.maps).toFixed(1)} />
        <Metric label="ADR" value={(event.adr_total / event.maps).toFixed(1)} />
        <Metric label="HS" value={`${hs}%`} />
        <Metric
          label="MVP"
          value={event.mvps}
          tone={event.mvps > 0 ? "warning" : "muted"}
        />
      </div>

      <Link
        href={`/events/${event.slug}/players/${encodeURIComponent(playerId)}`}
        className="group flex items-center justify-between border-border border-t px-4 py-2.5 text-muted-foreground text-sm transition-colors hover:bg-foreground/3 hover:text-foreground"
      >
        Match-by-match stats
        <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

export function PlayerEvents({
  events,
  playerId,
}: {
  events: PlayerEvent[];
  playerId: string;
}) {
  if (!events.length) {
    return (
      <Empty className="rounded-xl border border-border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTrophy />
          </EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            This player hasn't played in any tracked deaf CS2 event.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const wins = events.reduce((sum, e) => sum + e.wins, 0);
  const losses = events.reduce((sum, e) => sum + e.losses, 0);
  const maps = events.reduce((sum, e) => sum + e.maps, 0);
  const kills = events.reduce((sum, e) => sum + e.kills, 0);
  const deaths = events.reduce((sum, e) => sum + e.deaths, 0);
  const kd = kills / Math.max(deaths, 1);
  const kdTone = ratioTone(kd);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Events">{events.length}</SummaryTile>
        <SummaryTile label="Series">
          <span className="text-win">{wins}</span>
          <span className="text-faint">–</span>
          <span className="text-loss">{losses}</span>
        </SummaryTile>
        <SummaryTile label="Maps">{maps}</SummaryTile>
        <SummaryTile label="K/D">
          <span className={cn(kdTone && cellToneClass[kdTone])}>
            {kd.toFixed(2)}
          </span>
        </SummaryTile>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <EventCard key={event.slug} event={event} playerId={playerId} />
        ))}
      </div>
    </div>
  );
}

export function PlayerEventsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {range(4).map((index) => (
          <Skeleton key={index} className="h-21 rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {range(3).map((index) => (
          <Skeleton key={index} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
