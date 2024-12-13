import useSWR from "swr";

import { twitchConfig } from "@/lib/config";

interface TwitchStream {
  id: string;
  user_name: string;
  game_id: number;
  viewer_count: number;
}

interface TwitchAPIResponse {
  data: TwitchStream[];
}

async function getAccessToken(): Promise<string> {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: twitchConfig.CLIENT_ID,
      client_secret: twitchConfig.CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await response.json();
  return data.access_token;
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
  const token = await getAccessToken();
  const response = await fetch(url, {
    headers: {
      "Client-ID": twitchConfig.CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TwitchAPIResponse = await response.json();
  return data.data.filter(
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
