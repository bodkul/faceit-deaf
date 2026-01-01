"use client";

import { meanBy, sumBy, take } from "lodash-es";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
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
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

function StatisticCardSkeleton({ label }: { label: string }) {
  return (
    <Skeleton className="flex flex-col items-center space-y-1 rounded-lg border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
      <span className="flex text-sm font-medium text-muted-foreground">
        {label}
      </span>
    </Skeleton>
  );
}

function StatisticsCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center space-y-1 rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
      <span className="flex text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

export function StatisticsLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between gap-4">
          <CardTitle>Statistics</CardTitle>
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            "K/D/A",
            "K/D",
            "K/R",
            "Headshots %",
            "ADR",
            "Winrate",
            "Matches",
            "W/L History",
          ].map((label) => (
            <StatisticCardSkeleton key={label} label={label} />
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
    useState<PlayerStatisticsRange>("20matches");
  const { data, isLoading } = usePlayerStatistics(playerId, statisticsRange);

  const stats = useMemo(() => {
    const totalKills = sumBy(data, (p) => p.kills ?? 0);
    const totalDeaths = sumBy(data, (p) => p.deaths ?? 0);
    const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

    const totalHS = sumBy(data, (p) => p.headshots ?? 0);
    const hsPercent = totalKills > 0 ? (totalHS / totalKills) * 100 : 0;

    const matches = data?.length ?? 0;
    const wins = data?.filter((p) => p.win === true).length ?? 0;
    const winrate = (wins / matches) * 100;

    const history = take(data, 5)
      .map((m) => (m.win ? "W" : "L"))
      .reverse();

    const eloChartData = data
      ?.filter(
        (m): m is typeof m & { eloAfter: number; eloBefore: number } =>
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

  if (isLoading) return <StatisticsLoading />;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between gap-4">
          <CardTitle>Statistics</CardTitle>

          <Select
            value={statisticsRange}
            onValueChange={(value) =>
              setStatisticsRange(value as PlayerStatisticsRange)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alltime">All time</SelectItem>
              <SelectSeparator />
              <SelectItem value="20matches">20 matches</SelectItem>
              <SelectItem value="100matches">100 matches</SelectItem>
              <SelectSeparator />
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatisticsCard label="K/D/A">
            <span className="text-2xl font-bold">
              {stats.avgKills}/{stats.avgDeaths}/{stats.avgAssists}
            </span>
          </StatisticsCard>
          <StatisticsCard label="K/D">
            <span className="text-2xl font-bold">{stats.kd}</span>
          </StatisticsCard>
          <StatisticsCard label="K/R">
            <span className="text-2xl font-bold">{stats.kpr}</span>
          </StatisticsCard>
          <StatisticsCard label="Headshots %">
            <span className="text-2xl font-bold">{stats.hsPercent}</span>
          </StatisticsCard>
          <StatisticsCard label="ADR">
            <span className="text-2xl font-bold">{stats.adr}</span>
          </StatisticsCard>
          <StatisticsCard label="Winrate">
            <span className="text-2xl font-bold">{stats.winrate}</span>
          </StatisticsCard>
          <StatisticsCard label="Matches">
            <span className="text-2xl font-bold">{stats.matches}</span>
          </StatisticsCard>
          <StatisticsCard label="W/L History">
            <div className="flex items-center gap-1.5">
              {stats.history.map((result, index) => (
                <span
                  key={`history-${index + 1}`}
                  className={cn("text-xl font-bold", {
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

        <ChartContainer config={chartConfig} className="h-40 w-full">
          <AreaChart accessibilityLayer data={stats.eloChartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="match"
              domain={[
                Math.min(...stats.eloChartData.map((m) => m.elo)) - 10,
                Math.max(...stats.eloChartData.map((m) => m.elo)) + 10,
              ]}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={({ payload }) =>
                payload?.[0] ? (
                  <div className="rounded border bg-muted p-2 text-sm shadow-sm">
                    <div>ELO: {payload[0].payload.elo}</div>
                    <div>
                      Diff: {formatNumberWithSign(payload[0].payload.eloDiff)}
                    </div>
                  </div>
                ) : null
              }
            />
            <Area
              dataKey="elo"
              type="linear"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
