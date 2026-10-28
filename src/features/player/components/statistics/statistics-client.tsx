"use client";

import { IconChartBar } from "@tabler/icons-react";
import { cn } from "cn";
import { take } from "es-toolkit/array";
import { meanBy, sumBy } from "es-toolkit/compat";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  type PlayerStatisticsRange,
  usePlayerStatistics,
} from "@/features/player/hooks/use-player-statistics";
import { formatNumberWithSign } from "@/lib/format";

import { StatisticsLayout } from "./statistics-layout";
import { StatisticsSkeleton } from "./statistics-skeleton";

const chartConfig = {
  elo: { label: "ELO", color: "var(--chart-1)" },
} satisfies ChartConfig;

export type PlayerMatch = NonNullable<
  Awaited<ReturnType<typeof usePlayerStatistics>>["data"]
>[number];

function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "win" | "loss" | null;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-(--highlight)">
      <span className="font-mono text-[11px] tracking-wider text-faint uppercase">
        {label}
      </span>
      <span
        className={cn(
          "font-mono text-2xl font-black tabular-nums sm:text-3xl",
          tone === "win" && "text-win",
          tone === "loss" && "text-loss",
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function useStatisticsCalculation(data: PlayerMatch[] | undefined) {
  return useMemo(() => {
    if (!data?.length) return null;

    const totalKills = sumBy(data, (p) => p.kills ?? 0);
    const totalDeaths = sumBy(data, (p) => p.deaths ?? 0);
    const kd = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const totalHS = sumBy(data, (p) => p.headshots ?? 0);
    const matches = data.length;
    const wins = data.filter((p) => p.win === true).length;

    // Oldest → newest, starting from the ELO before the first match.
    const eloChartData = data
      .filter(
        (m): m is PlayerMatch & { eloAfter: number; eloBefore: number } =>
          typeof m.eloAfter === "number" && typeof m.eloBefore === "number",
      )
      .map((m) => ({ elo: m.eloAfter, eloDiff: m.eloAfter - m.eloBefore }))
      .reverse();
    const first = data.findLast((m) => typeof m.eloBefore === "number");
    if (eloChartData.length > 0 && first?.eloBefore != null) {
      eloChartData.unshift({ elo: first.eloBefore, eloDiff: 0 });
    }
    const chart = eloChartData.map((point, index) => ({
      ...point,
      match: index === 0 ? "Start" : `Match ${index}`,
    }));

    return {
      kd,
      hsPercent: totalKills > 0 ? (totalHS / totalKills) * 100 : 0,
      wins,
      losses: matches - wins,
      winrate: (wins / matches) * 100,
      kpr: meanBy(data, (p) => p.krRatio ?? 0),
      adr: meanBy(data, (p) => p.adr ?? 0),
      avgKills: meanBy(data, (p) => p.kills ?? 0),
      avgDeaths: meanBy(data, (p) => p.deaths ?? 0),
      avgAssists: meanBy(data, (p) => p.assists ?? 0),
      matches,
      // Newest last, so the strip reads left → right in time.
      form: take(data, 10)
        .map((m) => m.win)
        .reverse(),
      chart,
      eloChange:
        chart.length > 1 ? (chart.at(-1)?.elo ?? 0) - chart[0].elo : null,
    };
  }, [data]);
}

function FormStrip({ form }: { form: (boolean | null)[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-(--highlight) sm:flex-row sm:items-center sm:justify-between">
      <span className="font-mono text-[11px] tracking-wider text-faint uppercase">
        Recent form
      </span>
      <ol className="flex gap-1.5" aria-label="Recent results, oldest first">
        {form.map((win, index) => (
          <li
            key={index}
            className={cn(
              "flex size-7 items-center justify-center rounded-md font-mono text-xs font-bold",
              win === true && "bg-win/15 text-win",
              win === false && "bg-loss/15 text-loss",
              win === null && "bg-muted text-faint",
            )}
          >
            {win === true ? "W" : win === false ? "L" : "–"}
          </li>
        ))}
      </ol>
    </div>
  );
}

function EloChart({
  data,
  change,
}: {
  data: Array<{ match: string; elo: number; eloDiff: number }>;
  change: number | null;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-(--highlight) sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-wider text-faint uppercase">
          ELO progression
        </span>
        {change !== null && (
          <span
            className={cn(
              "font-mono text-sm font-bold tabular-nums",
              change > 0 && "text-win",
              change < 0 && "text-loss",
            )}
          >
            {formatNumberWithSign(change)}
          </span>
        )}
      </div>
      {data.length > 1 ? (
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <AreaChart data={data} margin={{ left: 0, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="fillElo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-elo)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-elo)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="match" hide />
            <YAxis
              domain={["dataMin - 15", "dataMax + 15"]}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={48}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border-strong)" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="elo"
              type="monotone"
              fill="url(#fillElo)"
              stroke="var(--color-elo)"
              strokeWidth={2}
              animationDuration={600}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Not enough matches with ELO data for a chart.
        </p>
      )}
    </div>
  );
}

function StatisticsEmpty(props: {
  statisticsRange: PlayerStatisticsRange;
  onRangeChange: (value: PlayerStatisticsRange) => void;
}) {
  return (
    <StatisticsLayout {...props}>
      <Empty className="rounded-xl border border-dashed border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconChartBar />
          </EmptyMedia>
          <EmptyTitle>No matches in this period</EmptyTitle>
          <EmptyDescription>
            Pick a longer time range, or check back after the next match.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </StatisticsLayout>
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
      <StatisticsEmpty
        statisticsRange={statisticsRange}
        onRangeChange={setStatisticsRange}
      />
    );
  }

  return (
    <StatisticsLayout
      statisticsRange={statisticsRange}
      onRangeChange={setStatisticsRange}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="K/D"
          value={stats.kd.toFixed(2)}
          tone={stats.kd >= 1.1 ? "win" : stats.kd < 0.9 ? "loss" : null}
          hint={`${stats.avgKills.toFixed(0)} / ${stats.avgDeaths.toFixed(0)} / ${stats.avgAssists.toFixed(0)} avg K/D/A`}
        />
        <StatTile
          label="ADR"
          value={stats.adr.toFixed(1)}
          hint={`${stats.kpr.toFixed(2)} kills per round`}
        />
        <StatTile
          label="Headshots"
          value={`${stats.hsPercent.toFixed(0)}%`}
          hint="of all kills"
        />
        <StatTile
          label="Win rate"
          value={`${stats.winrate.toFixed(0)}%`}
          tone={
            stats.winrate >= 55 ? "win" : stats.winrate < 45 ? "loss" : null
          }
          hint={`${stats.wins}W · ${stats.losses}L in ${stats.matches} matches`}
        />
      </div>

      <FormStrip form={stats.form} />

      <EloChart data={stats.chart} change={stats.eloChange} />
    </StatisticsLayout>
  );
}
