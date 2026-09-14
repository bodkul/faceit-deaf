import { range } from "es-toolkit";

import { Item, ItemContent, ItemGroup } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EventMatchesSkeleton() {
  return (
    <ItemGroup>
      {range(10).map((i) => (
        <Item
          key={i}
          variant="outline"
          className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm"
        >
          <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />

          <div className="grid w-full grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-4">
            <Skeleton className="size-10" />

            <ItemContent>
              <Skeleton className="h-[19.25px] w-16" />
            </ItemContent>

            <ItemContent className="shrink-0 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-6" />
                <span className="font-black font-mono text-neutral-700 text-xl">
                  :
                </span>
                <Skeleton className="h-7 w-6" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-[14.28px] w-12" />
                <span className="font-mono text-[10px] text-neutral-600">
                  ·
                </span>
                <Skeleton className="h-[14.28px] w-4" />
              </div>
            </ItemContent>

            <ItemContent className="items-end text-right">
              <Skeleton className="h-[19.25px] w-16" />
            </ItemContent>

            <Skeleton className="size-10" />
          </div>
        </Item>
      ))}
    </ItemGroup>
  );
}
