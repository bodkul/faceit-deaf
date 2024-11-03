import { CarouselItem } from "@/components/ui/carousel";

interface TwitchStream {
  id: string;
  user_name: string;
  title: string;
  viewer_count: number;
}

const baseUrl = "https://faceitdeaf.pro";

export default async function Page() {
  const response = await fetch(`${baseUrl}/api/twitch`);
  const twitchPlayers: TwitchStream[] = await response.json();

  return twitchPlayers.map((channel) => (
    <CarouselItem key={`channel_${channel.user_name}`}>
      <iframe
        src={`https://player.twitch.tv/?channel=${channel.user_name}&parent=${baseUrl}`}
        height="360"
        width="640"
        allowFullScreen
      ></iframe>
    </CarouselItem>
  ));
}
