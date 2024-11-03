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
    <Carousel>
      <CarouselContent className="h-auto w-auto">
        {twitchPlayers.map((channel) => (
          <CarouselItem key={`channel_${channel.user_name}`}>
            <Card>
              <CardContent className="flex items-center justify-center p-2">
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
