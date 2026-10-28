import { range } from "es-toolkit/math";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
          <Skeleton className="size-16 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          {range(4).map((index) => (
            <div
              key={index}
              className="flex flex-col gap-2 bg-card px-4 py-3 sm:px-6"
            >
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-6">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
