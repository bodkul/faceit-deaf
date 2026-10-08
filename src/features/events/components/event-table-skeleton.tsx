import { range } from "es-toolkit/math";

import { Skeleton } from "@/components/ui/skeleton";

export function Loading({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <div className="h-9 border-border border-b" />
      <div className="divide-y divide-border">
        {range(rows).map((index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
