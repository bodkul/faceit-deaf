import { range } from "es-toolkit/math";

import { Skeleton } from "@/components/ui/skeleton";

export function EventsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {range(count).map((index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-(--highlight)"
        >
          <Skeleton className="size-12 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-64 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
