"use client";

import { IconMap } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

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
import { usePlayerMaps } from "@/hooks/usePlayerMaps";

const chartConfig = {
  map: {
    label: "Map",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

function MapsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-red-500/4 blur-3xl" />
      <div className="border-neutral-800 border-b px-5 py-4">
        <h3 className="font-bold text-white">Maps Statistics</h3>
        <p className="text-neutral-500 text-sm">
          Distribution of maps played by this player
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
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
              style={{ fill: "#737373", fontSize: 11, fontFamily: "monospace" }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </MapsWrapper>
  );
}

export function MapsSkeleton() {
  const SKELETON_BARS = [
    { key: "mirage", h: 40 },
    { key: "inferno", h: 70 },
    { key: "dust2", h: 55 },
    { key: "nuke", h: 90 },
    { key: "anubis", h: 35 },
    { key: "ancient", h: 60 },
    { key: "vertigo", h: 45 },
  ];

  return (
    <MapsWrapper>
      <div className="flex h-64 items-end gap-3 px-4">
        {SKELETON_BARS.map(({ key, h }) => (
          <div key={key} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full animate-pulse rounded-md bg-neutral-800"
              style={{ height: `${h}%` }}
            />
            <div className="h-3 w-8 animate-pulse rounded bg-neutral-800" />
          </div>
        ))}
      </div>
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
