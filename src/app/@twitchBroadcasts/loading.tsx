import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Carousel>
      <CarouselContent className="h-[360px] w-[640px]">
        <CarouselItem>
          <Skeleton className="h-[360px] w-[640px]" />
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
