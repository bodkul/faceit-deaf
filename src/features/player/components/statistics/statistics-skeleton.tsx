import { CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { StatisticsLayout } from "./statistics-layout";

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

export function StatisticsSkeleton() {
  return (
    <StatisticsLayout>
      <CardContent className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_LABELS.map((label) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
          >
            <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
              {label}
            </span>
            <Skeleton className="mt-1 h-6 w-16 bg-neutral-800" />
          </div>
        ))}
      </CardContent>

      <Separator />

      <CardFooter>
        <Skeleton className="h-40 w-full bg-neutral-900" />
      </CardFooter>
    </StatisticsLayout>
  );
}
