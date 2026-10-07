"use client";

import { IconMap } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerMaps } from "@/features/player/hooks/use-player-maps";

const chartConfig = {
  map: {
    label: "Map",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

const _SKELETON_BARS = [
  { key: "mirage", h: 40 },
  { key: "inferno", h: 70 },
  { key: "dust2", h: 55 },
  { key: "nuke", h: 90 },
  { key: "anubis", h: 35 },
  { key: "ancient", h: 60 },
  { key: "vertigo", h: 45 },
] as const;

function MapsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      <CardHeader>
        <CardTitle>Map Statistics</CardTitle>
        <CardDescription>
          Distribution of maps played by this player
        </CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MapsContent({
  maps,
}: {
  maps: NonNullable<ReturnType<typeof usePlayerMaps>["data"]>;
}) {
  return (
    <MapsWrapper>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart accessibilityLayer data={maps}>
          <CartesianGrid vertical={false} stroke="#262626" />
          <XAxis
            dataKey="map"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: "#525252", fontSize: 11, fontFamily: "monospace" }}
            tickFormatter={(value) => {
              const short = value.slice(3);
              return short.charAt(0).toUpperCase() + short.slice(1);
            }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="count" fill="var(--color-map)" radius={6}>
            <LabelList
              position="top"
              offset={10}
              style={{
                fill: "#737373",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </MapsWrapper>
  );
}

export function MapsSkeleton() {
  return (
    <MapsWrapper>
      <Skeleton className="h-64 w-full bg-neutral-900" />
    </MapsWrapper>
  );
}

export function Maps({ playerId }: { playerId: string }) {
  const { data: maps, isLoading } = usePlayerMaps(playerId);

  if (isLoading) return <MapsSkeleton />;

  if (!maps) {
    return (
      <MapsWrapper>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconMap />
            </EmptyMedia>
            <EmptyTitle>No map data</EmptyTitle>
            <EmptyDescription>
              Map statistics will appear here once matches are played.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </MapsWrapper>
    );
  }

  return <MapsContent maps={maps} />;
}
