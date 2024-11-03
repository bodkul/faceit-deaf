import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getTwitchStreams } from "@/lib/api/twitch";

export default async function Page() {
  const twitchPlayers = await getTwitchStreams();

  if (!twitchPlayers.length) {
    return;
  }

  return (
    <Carousel>
      <CarouselContent className="h-[360px] w-[640px]">
        {twitchPlayers.map((channel) => (
          <CarouselItem key={`channel_${channel.user_name}`}>
            <iframe
              src={`https://player.twitch.tv/?channel=${channel.user_name}&parent=faceitdeaf.pro`}
              height="360"
              width="640"
              allowFullScreen
            ></iframe>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
