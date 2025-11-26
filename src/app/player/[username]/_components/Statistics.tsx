"use client";

import _ from "lodash";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePlayerStatistics } from "@/hooks/usePlayerStatistics";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "oklch(70.5% 0.213 47.604)",
  },
} satisfies ChartConfig;

export default function Statistics({ playerId }: { playerId: string }) {
  const [isAllTime, setIsAllTime] = useState(false);
  const { data, count, isLoading } = usePlayerStatistics(
    playerId,
    isAllTime ? undefined : 20,
  );

  const stats = useMemo(() => {
    const playerStats = _(data)
      .flatMap((m) =>
        m.match_teams.map((t) => ({
          win: t.team_win,
          stats: t.match_team_players[0]?.player_stats_normalized,
          eloBefore: t.match_team_players[0]?.elo_before,
          eloAfter: t.match_team_players[0]?.elo_after,
        })),
      )
      .compact();

    const totalKills = playerStats.sumBy((p) => p.stats?.kills ?? 0);
    const totalDeaths = playerStats.sumBy((p) => p.stats?.deaths ?? 0);
    const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;

    const totalHS = playerStats.sumBy((p) => p.stats?.headshots ?? 0);
    const hsPercent = totalKills > 0 ? (totalHS / totalKills) * 100 : 0;

    const totalMatches = playerStats.size();
    const wins = playerStats.filter((p) => p.win === true).size();
    const winrate = (wins / totalMatches) * 100;

    const kpr = playerStats.meanBy((p) => p.stats?.kr_ratio ?? 0);

    const eloDiff = playerStats
      .take(20)
      .sumBy((p) => (p.eloAfter ?? 0) - (p.eloBefore ?? 0));

    const history = playerStats
      .take(10)
      .map((m) => (m.win ? "W" : "L"))
      .reverse()
      .value();

    const eloChartData = playerStats
      .filter((m) => m.eloAfter !== null && m.eloBefore !== null)
      .map((m, index) => ({
        match: `#${index + 1}`,
        elo: m.eloAfter!,
        eloDiff: m.eloAfter! - m.eloBefore!,
      }))
      .reverse();

    return {
      kd: kd.toFixed(2),
      hsPercent: hsPercent.toFixed() + "%",
      winrate: winrate.toFixed() + "%",
      kpr: kpr.toFixed(2),
      eloDiff,
      history,
      eloChartData,
    };
  }, [data]);

  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>
                  {isAllTime
                    ? "All-time statistics"
                    : "Based on the last 20 matches"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 items-center justify-end space-x-2 rounded-lg border bg-muted/50 p-2">
                  <Switch id="all-time-toggle" disabled />
                  <Label htmlFor="all-time-toggle">All Time</Label>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  K/D
                </span>
              </Skeleton>
              <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  Headshots
                </span>
              </Skeleton>
              <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  Winrate
                </span>
              </Skeleton>
              <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  Total Matches
                </span>
              </Skeleton>
              <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  Kills per Round
                </span>
              </Skeleton>
              {isAllTime ? (
                <div className="relative flex min-h-[90px] items-center justify-center overflow-hidden rounded-lg border border-muted-foreground/20 bg-muted/10 p-4">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgb(107, 114, 128) 8px, rgb(107, 114, 128) 10px)",
                    }}
                  ></div>
                </div>
              ) : (
                <Skeleton className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                  <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                    +/- ELO
                  </span>
                </Skeleton>
              )}
              <Skeleton className="relative col-span-2 flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-12 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  W/L History
                </span>
              </Skeleton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elo Statistics</CardTitle>
            <CardDescription>
              Based on the last {stats.eloChartData.size()} matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[150px] w-full">
              <AreaChart accessibilityLayer data={stats.eloChartData.value()}>
                <CartesianGrid vertical={false} />
                <YAxis
                  dataKey="match"
                  domain={[
                    Math.min(...stats.eloChartData.map((m) => m.elo).value()) -
                      10,
                    Math.max(...stats.eloChartData.map((m) => m.elo).value()) +
                      10,
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
                          Diff:{" "}
                          {formatNumberWithSign(payload[0].payload.eloDiff)}
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
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>
                {isAllTime
                  ? "All-time statistics"
                  : "Based on the last 20 matches"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 items-center justify-end space-x-2 rounded-lg border bg-muted/50 p-2">
                <Switch id="all-time-toggle" onCheckedChange={setIsAllTime} />
                <Label htmlFor="all-time-toggle">All Time</Label>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                K/D
              </span>
              <span className="text-2xl font-bold">{stats.kd}</span>
            </div>
            <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                Headshots
              </span>
              <span className="text-2xl font-bold">{stats.hsPercent}</span>
            </div>
            <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                Winrate
              </span>
              <span className="text-2xl font-bold">{stats.winrate}</span>
            </div>
            <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                Total Matches
              </span>
              <span className="text-2xl font-bold">{count}</span>
            </div>
            <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                Kills per Round
              </span>
              <span className="text-2xl font-bold">{stats.kpr}</span>
            </div>
            {isAllTime ? (
              <div className="relative flex min-h-[90px] items-center justify-center overflow-hidden rounded-lg border border-muted-foreground/20 bg-muted/10 p-4">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgb(107, 114, 128) 8px, rgb(107, 114, 128) 10px)",
                  }}
                ></div>
              </div>
            ) : (
              <div className="relative flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                  +/- ELO
                </span>
                <span className="text-2xl font-bold">
                  {formatNumberWithSign(stats.eloDiff)}
                </span>
              </div>
            )}
            <div className="relative col-span-2 flex min-h-[90px] flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
              <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                W/L History
              </span>
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elo Statistics</CardTitle>
          <CardDescription>
            Based on the last {stats.eloChartData.size()} matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <AreaChart accessibilityLayer data={stats.eloChartData.value()}>
              <CartesianGrid vertical={false} />
              <YAxis
                dataKey="match"
                domain={[
                  Math.min(...stats.eloChartData.map((m) => m.elo).value()) -
                    10,
                  Math.max(...stats.eloChartData.map((m) => m.elo).value()) +
                    10,
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
    </>
  );
}
