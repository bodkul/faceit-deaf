import { Skeleton } from "@/components/ui/skeleton";

export function PlayerCardSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex items-center gap-4 sm:gap-5">
        <Skeleton className="size-16 rounded-xl sm:size-20" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-8 w-44" />
          <div className="flex gap-1.5">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton className="h-20 rounded-xl sm:w-56" />
    </div>
  );
}
