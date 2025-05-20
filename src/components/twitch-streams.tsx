"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useTwitchStreams from "@/hooks/useTwitchStreams";
import useTwitchUsernames from "@/hooks/useTwitchUsernames";
import { twitchConfig } from "@/lib/config";

export default function TwitchStreams() {
  const twitchUsernames = useTwitchUsernames();
  const { twitchStreams, isLoading } = useTwitchStreams(twitchUsernames);

  if (isLoading || !twitchStreams.length) {
    return;
  }

  return (
    <Carousel className="w-full max-w-[320px] min-[480px]:max-w-[480px] sm:max-w-[640px]">
      <CarouselContent>
        {twitchStreams.map((stream) => (
          <CarouselItem key={`channel_${stream.user_name}`}>
            <Card>
              <CardContent className="flex h-[180px] items-center justify-center p-2 min-[480px]:h-[270px] sm:h-[360px]">
                <iframe
                  src={`https://player.twitch.tv/?channel=${stream.user_name}&parent=${twitchConfig.PARENT_DOMAIN}`}
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
