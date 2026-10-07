import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function StatisticsHeader({
  statisticsRange,
  onRangeChange,
}: {
  statisticsRange: PlayerStatisticsRange | undefined;
  onRangeChange: ((value: PlayerStatisticsRange) => void) | undefined;
}) {
  return (
    <CardHeader>
      <CardTitle>Statistics</CardTitle>
      <CardDescription>Performance metrics and ELO progression</CardDescription>
      {statisticsRange && onRangeChange && (
        <CardAction>
          <Select
            items={TIME_RANGES}
            value={statisticsRange}
            onValueChange={(value) => {
              if (value) onRangeChange(value);
            }}
          >
            <SelectTrigger className="w-40 border-neutral-800 bg-neutral-900 text-neutral-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-neutral-800 bg-neutral-950">
              <SelectGroup>
                {TIME_RANGES.map((range, index) => (
                  <div key={range.value}>
                    {(index === 1 || index === 4) && (
                      <SelectSeparator className="bg-neutral-800" />
                    )}
                    <SelectItem
                      value={range.value}
                      className="text-neutral-300 focus:bg-neutral-800 focus:text-white"
                    >
                      {range.label}
                    </SelectItem>
                  </div>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardAction>
      )}
    </CardHeader>
  );
}
