import { range } from "es-toolkit/math";

import { Item, ItemContent, ItemGroup, ItemMedia } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

export function EventsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ItemGroup>
        {range(4).map((index) => (
          <Item
            key={index}
            variant="outline"
            className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm"
          >
            <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />
            <ItemMedia>
              <Skeleton className="size-10" />
            </ItemMedia>
            <ItemContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-[19.25px] w-56" />
                <Skeleton className="h-4 w-20.5" />
              </div>
              <Skeleton className="h-5.25 w-52" />
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
