import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlayerCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 p-6 backdrop-blur-sm md:flex-row md:justify-between md:p-8">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />
      <div className="flex flex-row gap-4">
        <Skeleton className="size-17 rounded-md md:size-18" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-5 rounded-xs" />
            <Skeleton className="h-7 w-36 md:h-8" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-9.5" />
            <Skeleton className="h-8 w-9.5" />
          </div>
        </div>
      </div>
      <div className="md:w-48">
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-neutral-900/50 px-4 py-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[#888888] text-[10px] uppercase tracking-wide">
              Faceit ELO
            </span>
            <Skeleton className="h-7 w-14" />
          </div>
        </div>
      </div>
    </Card>
  );
}
