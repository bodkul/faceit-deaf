import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Carousel>
      <CarouselContent className="h-[360px] w-[640px]">
        {children}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
