import { range } from "es-toolkit";

import { Skeleton } from "@/components/ui/skeleton";

export function EventMatchesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-36" />
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
        {range(8).map((i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3.5"
          >
            <div className="flex items-center justify-end gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-14" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
