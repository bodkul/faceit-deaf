import { Card, CardContent } from "@/components/ui/card";
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
    <Carousel className="w-full sm:max-w-[640px] min-[480px]:max-w-[480px] max-w-[320px]">
      <CarouselContent>
        {twitchPlayers.map((channel) => (
          <CarouselItem key={`channel_${channel.user_name}`}>
            <Card>
              <CardContent className="flex items-center justify-center p-2 sm:h-[360px] min-[480px]:h-[270px] h-[180px]">
                <iframe
                  src={`https://player.twitch.tv/?channel=${channel.user_name}&parent=faceitdeaf.pro`}
                  height="360"
                  width="640"
                  allowFullScreen
                ></iframe>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
