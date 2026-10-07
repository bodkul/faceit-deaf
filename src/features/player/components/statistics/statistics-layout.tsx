import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlayerStatisticsRange } from "@/features/player/hooks/use-player-statistics";

import { StatisticsHeader } from "./statistics-header";

export function StatisticsLayout({
  children,
  statisticsRange,
  onRangeChange,
}: {
  children: React.ReactNode;
  statisticsRange?: PlayerStatisticsRange;
  onRangeChange?: (value: PlayerStatisticsRange) => void;
}) {
  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      {statisticsRange && onRangeChange ? (
        <StatisticsHeader
          statisticsRange={statisticsRange}
          onRangeChange={onRangeChange}
        />
      ) : (
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>
            Performance metrics and ELO progression
          </CardDescription>
        </CardHeader>
      )}

      {children}
    </Card>
  );
}
