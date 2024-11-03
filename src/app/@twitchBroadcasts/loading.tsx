import { CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <CarouselItem>
      <Skeleton className="h-[360px] w-[640px]" />
    </CarouselItem>
  );
}
