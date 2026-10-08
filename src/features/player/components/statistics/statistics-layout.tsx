"use client";

import { SectionHeader } from "@/components/section-header";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlayerStatisticsRange } from "@/features/player/hooks/use-player-statistics";

const TIME_RANGES = [
  { value: "currentSession", label: "Current session" },
  { value: "last20Matches", label: "Last 20 matches" },
  { value: "last7Days", label: "Last 7 days" },
  { value: "last30Days", label: "Last 30 days" },
  { value: "allTime", label: "All time" },
] as const;

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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader
          title="Performance"
          description="Averages and ELO over the selected period"
        />
        <Select
          items={TIME_RANGES}
          value={statisticsRange ?? "last20Matches"}
          disabled={!onRangeChange}
          onValueChange={(value) => {
            if (value) onRangeChange?.(value);
          }}
        >
          <SelectTrigger className="w-44 bg-card" aria-label="Time range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TIME_RANGES.map((range, index) => (
                <div key={range.value}>
                  {(index === 1 || index === 4) && <SelectSeparator />}
                  <SelectItem value={range.value}>{range.label}</SelectItem>
                </div>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {children}
    </section>
  );
}
