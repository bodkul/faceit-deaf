"use client";

import { IconChartBar } from "@tabler/icons-react";
import { add, maxBy, meanBy, minBy, subtract, sumBy, take } from "lodash-es";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";

import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type PlayerStatisticsRange,
  usePlayerStatistics,
} from "@/hooks/usePlayerStatistics";
import { cn } from "@/lib/utils";

const chartConfig = {
  elo: {
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

const STAT_LABELS = [
  "K/D/A",
  "K/D",
  "K/R",
  "Headshots %",
  "ADR",
  "Winrate",
  "Matches",
  "W/L History",
] as const;

const TIME_RANGES = [
  { value: "currentSession", label: "Current session" },
  { value: "last20Matches", label: "Last 20 matches" },
  { value: "last7Days", label: "Last 7 days" },
  { value: "last30Days", label: "Last 30 days" },
  { value: "allTime", label: "All time" },
] as const;

export type PlayerMatch = NonNullable<
  Awaited<ReturnType<typeof usePlayerStatistics>>["data"]
>[number];

interface StatisticsCardProps {
  label: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

function StatisticsCard({ label, children, isLoading }: StatisticsCardProps) {
  const baseClasses =
    "flex flex-col items-center space-y-1 rounded-lg border p-4 transition-colors";

  if (isLoading) {
    return (
      <Skeleton
        className={cn(baseClasses, "bg-muted/30 pb-13 hover:bg-muted/50")}
      >
        <span className="flex font-medium text-muted-foreground text-sm">
          {label}
        </span>
      </Skeleton>
    );
  }

  return (
    <div className={cn(baseClasses, "bg-muted/30 hover:bg-muted/50")}>
      <span className="flex font-medium text-muted-foreground text-sm">
        {label}
      </span>
      {children}
    </div>
  );
}

function StatisticsHeader({
  statisticsRange,
  onRangeChange,
}: {
  statisticsRange: PlayerStatisticsRange;
  onRangeChange: (value: PlayerStatisticsRange) => void;
}) {
  return (
    <CardHeader>
      <CardTitle>Statistics</CardTitle>
      <CardDescription>Performance metrics and ELO progression</CardDescription>
      <CardAction>
        <Select value={statisticsRange} onValueChange={onRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range, index) => (
              <div key={range.value}>
                {(index === 1 || index === 4) && <SelectSeparator />}
                <SelectItem value={range.value}>{range.label}</SelectItem>
              </div>
            ))}
          </SelectContent>
        </Select>
      </CardAction>
    </CardHeader>
  );
}

function EloChart({
  data,
}: {
  data: Array<{ match: string; elo: number; eloDiff: number }>;
}) {
  return (
    <ChartContainer config={chartConfig} className="h-40 w-full">
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <YAxis
          dataKey="match"
          domain={[
            subtract(minBy(data, "elo")?.elo ?? 0, 10),
            add(maxBy(data, "elo")?.elo ?? 0, 10),
          ]}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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

    const eloChartData =
      data
        .filter(
          (m): m is PlayerMatch & { eloAfter: number; eloBefore: number } =>
            typeof m.eloAfter === "number" && typeof m.eloBefore === "number",
        )
        .map((m, index) => ({
          match: `#${index + 1}`,
          elo: m.eloAfter,
          eloDiff: m.eloAfter - m.eloBefore,
        }))
        .reverse() || [];

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

export function StatisticsSkeleton() {
  return (
    <Card>
      <StatisticsHeader
        statisticsRange="last20Matches"
        onRangeChange={() => {}}
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_LABELS.map((label) => (
            <StatisticsCard key={label} label={label} isLoading />
          ))}
        </div>
        <Separator />
        <div className="h-40 w-full" />
      </CardContent>
    </Card>
  );
}

export default function Statistics({ playerId }: { playerId: string }) {
  const [statisticsRange, setStatisticsRange] =
    useState<PlayerStatisticsRange>("last20Matches");
  const { data, isLoading } = usePlayerStatistics(playerId, statisticsRange);
  const stats = useStatisticsCalculation(data);

  if (isLoading) return <StatisticsSkeleton />;

  if (!stats) {
    return (
      <Card>
        <StatisticsHeader
          statisticsRange={statisticsRange}
          onRangeChange={setStatisticsRange}
        />
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
      </Card>
    );
  }

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
    <Card>
      <StatisticsHeader
        statisticsRange={statisticsRange}
        onRangeChange={setStatisticsRange}
      />

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statisticsData.map(({ label, value }) => (
            <StatisticsCard key={label} label={label}>
              <span className="font-bold text-2xl">{value}</span>
            </StatisticsCard>
          ))}
          <StatisticsCard label="W/L History">
            <div className="flex items-center gap-1.5">
              {stats.history.map((result, index) => (
                <span
                  key={`${result}-${stats.eloChartData[index]?.match ?? index}`}
                  className={cn("font-bold text-xl", {
                    "text-rose-500": result === "L",
                    "text-emerald-500": result === "W",
                  })}
                >
                  {result}
                </span>
              ))}
            </div>
          </StatisticsCard>
        </div>

        <Separator />
        <EloChart data={stats.eloChartData} />
      </CardContent>
    </Card>
  );
}
