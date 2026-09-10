"use client";

import { IconChartBar } from "@tabler/icons-react";
import { cn } from "cn";
import { take } from "es-toolkit/array";
import { meanBy, sumBy } from "es-toolkit/compat";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";

import { CardContent, CardFooter } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
  type PlayerStatisticsRange,
  usePlayerStatistics,
} from "@/hooks/usePlayerStatistics";

import { StatisticsLayout } from "./statistics-layout";
import { StatisticsSkeleton } from "./statistics-skeleton";

const chartConfig = {
  elo: { color: "var(--chart-2)" },
} satisfies ChartConfig;

export type PlayerMatch = NonNullable<
  Awaited<ReturnType<typeof usePlayerStatistics>>["data"]
>[number];

function StatCard({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:bg-neutral-800/50">
      <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
        {label}
      </span>
      {value && (
        <span className="font-bold font-mono text-white text-xl">{value}</span>
      )}
      {children}
    </div>
  );
}

function EloChart({
  data,
}: {
  data: Array<{ match: string; elo: number; eloDiff: number }>;
}) {
  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: -20,
        }}
      >
        <CartesianGrid vertical={false} />
        <YAxis
          domain={["dataMin - 10", "dataMax + 10"]}
          tickLine={false}
          axisLine={false}
          tickMargin={5}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <defs>
          <linearGradient id="fillElo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-elo)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-elo)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="elo"
          type="natural"
          fill="url(#fillElo)"
          fillOpacity={0.4}
          stroke="var(--color-elo)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

function useStatisticsCalculation(data: PlayerMatch[] | undefined) {
  return useMemo(() => {
    if (!data?.length) return null;

    const totalKills = sumBy(data, (p) => p.kills ?? 0);
    const totalDeaths = sumBy(data, (p) => p.deaths ?? 0);
    const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const totalHS = sumBy(data, (p) => p.headshots ?? 0);
    const hsPercent = totalKills > 0 ? (totalHS / totalKills) * 100 : 0;
    const matches = data.length;
    const wins = data.filter((p) => p.win === true).length;
    const winrate = (wins / matches) * 100;
    const history = take(data, 5)
      .map((m) => (m.win ? "W" : "L"))
      .reverse();

    const eloChartData = data
      .filter(
        (m): m is PlayerMatch & { eloAfter: number; eloBefore: number } =>
          typeof m.eloAfter === "number" && typeof m.eloBefore === "number",
      )
      .map((m, index) => ({
        match: `#${index + 1}`,
        elo: m.eloAfter,
        eloDiff: m.eloAfter - m.eloBefore,
      }))
      .reverse();

    if (eloChartData.length > 0) {
      const firstMatch = data
        .filter(
          (m): m is PlayerMatch & { eloBefore: number } =>
            typeof m.eloBefore === "number",
        )
        .at(-1);

      if (firstMatch) {
        eloChartData.unshift({
          match: "#0",
          elo: firstMatch.eloBefore,
          eloDiff: 0,
        });
      }
    }

    return {
      kd: kd.toFixed(2),
      hsPercent: `${hsPercent.toFixed()}%`,
      winrate: `${winrate.toFixed()}%`,
      kpr: meanBy(data, (p) => p.krRatio ?? 0).toFixed(2),
      history,
      eloChartData,
      matches,
      avgKills: meanBy(data, (p) => p.kills ?? 0).toFixed(),
      avgDeaths: meanBy(data, (p) => p.deaths ?? 0).toFixed(),
      avgAssists: meanBy(data, (p) => p.assists ?? 0).toFixed(),
      adr: meanBy(data, (p) => p.adr ?? 0).toFixed(1),
    };
  }, [data]);
}

function StatisticsEmpty() {
  return (
    <StatisticsLayout>
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconChartBar />
            </EmptyMedia>
            <EmptyTitle>No statistics yet</EmptyTitle>
            <EmptyDescription>
              Statistics will appear here once matches are played.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </StatisticsLayout>
  );
}

export default function Statistics({ playerId }: { playerId: string }) {
  const [statisticsRange, setStatisticsRange] =
    useState<PlayerStatisticsRange>("last20Matches");
  const { data, isLoading } = usePlayerStatistics(playerId, statisticsRange);
  const stats = useStatisticsCalculation(data);

  if (isLoading) return <StatisticsSkeleton />;

  if (!stats) return <StatisticsEmpty />;

  const statisticsData = [
    {
      label: "K/D/A",
      value: `${stats.avgKills}/${stats.avgDeaths}/${stats.avgAssists}`,
    },
    { label: "K/D", value: stats.kd },
    { label: "K/R", value: stats.kpr },
    { label: "Headshots %", value: stats.hsPercent },
    { label: "ADR", value: stats.adr },
    { label: "Winrate", value: stats.winrate },
    { label: "Matches", value: stats.matches },
  ];

  return (
    <StatisticsLayout
      statisticsRange={statisticsRange}
      onRangeChange={setStatisticsRange}
    >
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statisticsData.map(({ label, value }) => (
          <StatCard key={label} label={label} value={value} />
        ))}
        <StatCard label="W/L History">
          <div className="flex items-center gap-1.5">
            {stats.history.map((result, index) => (
              <span
                key={`${result}-${stats.eloChartData[index]?.match ?? index}`}
                className={cn("font-bold font-mono text-lg", {
                  "text-rose-400": result === "L",
                  "text-emerald-400": result === "W",
                })}
              >
                {result}
              </span>
            ))}
          </div>
        </StatCard>
      </CardContent>

      <Separator />

      <CardFooter>
        <EloChart data={stats.eloChartData} />
      </CardFooter>
    </StatisticsLayout>
  );
}
