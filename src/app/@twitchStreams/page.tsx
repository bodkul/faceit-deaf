import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getTwitchStreams } from "@/lib/api/twitch";
import { getTwitchUsernames } from "@/lib/database/players";

const PARENT_DOMAIN = process.env.NEXT_PUBLIC_PARENT_DOMAIN;

export default async function Page() {
  const twitchUsernames = await getTwitchUsernames();
  const twitchStreams = await getTwitchStreams(twitchUsernames);

  if (!twitchStreams.length) {
    return;
  }

  return (
    <Carousel className="w-full sm:max-w-[640px] min-[480px]:max-w-[480px] max-w-[320px]">
      <CarouselContent>
        {twitchStreams.map((stream) => (
          <CarouselItem key={`channel_${stream.user_name}`}>
            <Card>
              <CardContent className="flex items-center justify-center p-2 sm:h-[360px] min-[480px]:h-[270px] h-[180px]">
                <iframe
                  src={`https://player.twitch.tv/?channel=${stream.user_name}&parent=${PARENT_DOMAIN}`}
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
