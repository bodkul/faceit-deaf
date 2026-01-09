"use client";

import { add, maxBy, meanBy, minBy, subtract, sumBy, take } from "lodash-es";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
import { cn } from "@/lib/utils";

const chartConfig = {
  elo: {
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

function StatisticCardSkeleton({ label }: { label: string }) {
  return (
    <Skeleton className="flex flex-col items-center space-y-1 rounded-lg border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
      <span className="flex font-medium text-muted-foreground text-sm">
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
      <span className="flex font-medium text-muted-foreground text-sm">
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
    React.useState<PlayerStatisticsRange>("last20Matches");
  const { data, isLoading } = usePlayerStatistics(playerId, statisticsRange);

  const stats = React.useMemo(() => {
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

    const eloChartData =
      data
        ?.filter(
          (m) => typeof m.elo === "number" || typeof m.eloDelta === "number",
        )
        .map((m, index) => ({
          match: `#${index + 1}`,
          elo: m.elo,
          eloDelta: m.eloDelta,
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
              <SelectItem value="currentSession">Current session</SelectItem>
              <SelectSeparator />

              <SelectItem value="last20Matches">Last 20 matches</SelectItem>
              <SelectItem value="last7Days">Last 7 days</SelectItem>
              <SelectItem value="last30Days">Last 30 days</SelectItem>
              <SelectSeparator />

              <SelectItem value="allTime">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
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
          ].map(({ label, value }) => (
            <StatisticsCard key={label} label={label}>
              <span className="font-bold text-2xl">{value}</span>
            </StatisticsCard>
          ))}
          <StatisticsCard label="W/L History">
            <div className="flex items-center gap-1.5">
              {stats.history.map((result, index) => (
                <span
                  key={`history-${index + 1}`}
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

        <ChartContainer config={chartConfig} className="h-40 w-full">
          <AreaChart accessibilityLayer data={stats.eloChartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="match"
              domain={[
                subtract(minBy(stats.eloChartData, "elo")?.elo ?? 0, 10),
                add(maxBy(stats.eloChartData, "elo")?.elo ?? 0, 10),
              ]}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillElo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-elo)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-elo)"
                  stopOpacity={0.1}
                />
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
      </CardContent>
    </Card>
  );
}
