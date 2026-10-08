import { range } from "es-toolkit/math";

import { Skeleton } from "@/components/ui/skeleton";

import { StatisticsLayout } from "./statistics-layout";

export function StatisticsSkeleton() {
  return (
    <StatisticsLayout>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {range(4).map((index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </StatisticsLayout>
  );
}
