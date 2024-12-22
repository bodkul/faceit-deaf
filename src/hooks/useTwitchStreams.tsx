import useSWR from "swr";

import { twitchConfig } from "@/lib/config";
import { fetchTwitchAccessToken } from "@/lib/twitch/api";
import twitchClient from "@/lib/twitch/client";

interface TwitchStreamsResponse {
  data: {
    id: string;
    user_name: string;
    game_id: number;
    viewer_count: number;
  }[];
}

function buildTwitchAPIUrl(twitchUsernames: string[]) {
  const baseUrl = "https://api.twitch.tv/helix/streams";
  const url = new URL(baseUrl);

  twitchUsernames.forEach((username) => {
    url.searchParams.append("user_login", username);
  });

  return url.toString();
}

export async function fetcher(url: string) {
  const token = await fetchTwitchAccessToken();
  const response = await twitchClient.get<TwitchStreamsResponse>(url, {
    headers: {
      "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data.filter(
    (stream) => stream.game_id == twitchConfig.CS2_GAME_ID,
  );
}

export default function useTwitchStreams(twitchUsernames: string[]) {
  const apiUrl = buildTwitchAPIUrl(twitchUsernames);
  const { data, isLoading } = useSWR(
    twitchUsernames.length ? apiUrl : null,
    fetcher,
  );

  return {
    twitchStreams: data || [],
    isLoading,
  };
}
