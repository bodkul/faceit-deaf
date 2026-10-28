import { range } from "es-toolkit/math";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <div className="h-9 border-b border-border bg-foreground/2" />
      <div className="divide-y divide-border">
        {range(10).map((index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
