"use client";

import { IconMap } from "@tabler/icons-react";
import { cn } from "cn";
import { range } from "es-toolkit/math";

import { MapBackground } from "@/components/map-background";
import { SectionHeader } from "@/components/section-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type PlayerMapStats,
  usePlayerMaps,
} from "@/features/player/hooks/use-player-maps";

function MapsSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Maps"
        description="Every match played, grouped by map"
      />
      {children}
    </section>
  );
}

function MapCard({ stats, share }: { stats: PlayerMapStats; share: number }) {
  const name = stats.map.replace("de_", "");

  return (
    <div className="relative isolate flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-(--highlight)">
      <MapBackground map={stats.map} className="opacity-35" />

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-lg capitalize">{name}</span>
        <span className="font-mono text-muted-foreground text-sm tabular-nums">
          {stats.matches} {stats.matches === 1 ? "match" : "matches"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
            Win rate
          </span>
          <span
            className={cn(
              "font-bold font-mono text-xl tabular-nums",
              stats.winrate >= 55 && "text-win",
              stats.winrate < 45 && "text-loss",
            )}
          >
            {stats.winrate.toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
            Avg K/D
          </span>
          <span className="font-bold font-mono text-xl tabular-nums">
            {stats.kd?.toFixed(2) ?? "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.max(share, 2)}%` }}
          />
        </div>
        <span className="text-faint text-xs">
          {share.toFixed(0)}% of all matches
        </span>
      </div>
    </div>
  );
}

export function MapsSkeleton() {
  return (
    <MapsSection>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {range(6).map((index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    </MapsSection>
  );
}

export function Maps({ playerId }: { playerId: string }) {
  const { data: maps, isLoading } = usePlayerMaps(playerId);

  if (isLoading) return <MapsSkeleton />;

  if (!maps?.length) {
    return (
      <MapsSection>
        <Empty className="rounded-xl border border-border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconMap />
            </EmptyMedia>
            <EmptyTitle>No map data yet</EmptyTitle>
            <EmptyDescription>
              Map statistics appear once matches are played.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MapsSection>
    );
  }

  const total = maps.reduce((sum, m) => sum + m.matches, 0);

  return (
    <MapsSection>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {maps.map((stats) => (
          <MapCard
            key={stats.map}
            stats={stats}
            share={(stats.matches / total) * 100}
          />
        ))}
      </div>
    </MapsSection>
  );
}
