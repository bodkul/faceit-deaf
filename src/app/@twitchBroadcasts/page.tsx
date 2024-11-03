import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TwitchStream {
  id: string;
  user_name: string;
  title: string;
  viewer_count: number;
}

export default async function Page() {
  const response = await fetch("https://faceitdeaf.pro/api/twitch");
  const twitchPlayers: TwitchStream[] = await response.json();

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
