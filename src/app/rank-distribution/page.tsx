"use client";

import { useQuery } from "@tanstack/react-query";
import { sumBy } from "es-toolkit/compat";
import { Cell, Pie, PieChart } from "recharts";

import { SkillLevelIcon } from "@/components/icons";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<number, string> = {
  1: "#eeeeee",
  2: "#1ce400",
  3: "#1ce400",
  4: "#ffc800",
  5: "#ffc800",
  6: "#ffc800",
  7: "#ffc800",
  8: "#ff6309",
  9: "#ff6309",
  10: "#fe1f00",
};

const LEVEL_ELO: Record<number, string> = {
  1: "1–500",
  2: "501–750",
  3: "751–900",
  4: "901–1050",
  5: "1051–1200",
  6: "1201–1350",
  7: "1351–1530",
  8: "1531–1750",
  9: "1751–2000",
  10: "2001+",
};

function useRankDistribution() {
  return useQuery({
    queryKey: ["rank-distribution"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("players")
        .select("skill_level");
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function DistributionRow({
  level,
  count,
  total,
  isHighlighted,
}: {
  level: number;
  count: number;
  total: number;
  isHighlighted?: boolean;
}) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  const color = LEVEL_COLORS[level];

  return (
    <div
      className={cn(
        "group grid grid-cols-[2rem_1fr_auto_auto] items-center gap-4 border-neutral-800/50 border-b px-4 py-3 transition-colors last:border-0 hover:bg-neutral-800/30",
        isHighlighted && "bg-neutral-800/20",
      )}
    >
      <SkillLevelIcon level={level} className="size-8 shrink-0" />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-neutral-500 text-xs">
            {LEVEL_ELO[level]} ELO
          </span>
          <span className="font-bold font-mono text-sm text-white">
            {percent.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div className="w-16 text-right">
        <span className="font-mono text-neutral-400 text-sm tabular-nums">
          {count.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function DistributionSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="border-neutral-800 border-b px-5 py-4">
        <Skeleton className="mb-1.5 h-5 w-40 bg-neutral-800" />
        <Skeleton className="h-4 w-56 bg-neutral-800" />
      </div>
      {Array.from({ length: 10 }, (_, i) => `skeleton-${i + 1}`).map((key) => (
        <div
          key={key}
          className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-neutral-800/50 border-b px-4 py-3 last:border-0"
        >
          <Skeleton className="size-8 rounded bg-neutral-800" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24 bg-neutral-800" />
            <Skeleton className="h-1.5 w-full rounded-full bg-neutral-800" />
          </div>
          <Skeleton className="h-4 w-10 bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

const chartConfig = {} satisfies ChartConfig;

export default function RankDistributionPage() {
  const { data: players, isLoading } = useRankDistribution();

  if (isLoading) return <DistributionSkeleton />;

  const counts: Record<number, number> = {};
  for (let i = 1; i <= 10; i++) counts[i] = 0;
  for (const p of players ?? []) {
    if (p.skill_level) counts[p.skill_level]++;
  }

  const total = sumBy(Object.values(counts), (c) => c);

  const pieData = Object.entries(counts).map(([level, count]) => ({
    level: Number(level),
    count,
    color: LEVEL_COLORS[Number(level)],
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-black text-2xl text-white">Rank Distribution</h1>
          <p className="text-neutral-500 text-sm">
            {total.toLocaleString()} registered players
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-neutral-800 border-b px-5 py-4">
              <h3 className="font-bold text-white">Distribution by Level</h3>
              <p className="text-neutral-500 text-sm">
                Percentage of players at each skill level
              </p>
            </div>
            {Array.from({ length: 10 }, (_, i) => i + 1)
              .reverse()
              .map((level) => (
                <DistributionRow
                  key={level}
                  level={level}
                  count={counts[level]}
                  total={total}
                />
              ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="border-neutral-800 border-b px-5 py-4">
              <h3 className="font-bold text-white">Overview</h3>
            </div>
            <div className="flex items-center justify-center p-5">
              <ChartContainer config={chartConfig} className="h-64 w-64">
                <PieChart>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const { level, count } = payload[0].payload;
                      const percent = ((count / total) * 100).toFixed(1);
                      return (
                        <div className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 shadow-xl">
                          <div className="flex items-center gap-2">
                            <SkillLevelIcon level={level} className="size-5" />
                            <span className="font-mono text-sm text-white">
                              Level {level}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-neutral-400 text-xs">
                            {count} players · {percent}%
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="#0a0a0a"
                  >
                    {pieData.map(({ level, color }) => (
                      <Cell key={level} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-2 gap-1 px-4 pb-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: LEVEL_COLORS[level] }}
                  />
                  <span className="font-mono text-neutral-500 text-xs">
                    Lvl {level} · {((counts[level] / total) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
