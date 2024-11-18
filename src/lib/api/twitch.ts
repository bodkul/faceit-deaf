const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET as string;
const TWITCH_CS2_GAME_ID = 32399;

interface TwitchStream {
  id: string;
  user_name: string;
  game_id: number;
  viewer_count: number;
}

interface TwitchAPIResponse {
  data: TwitchStream[];
}

export const fetchCache = "force-no-store";

async function getAccessToken(): Promise<string> {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Ошибка получения токена: ${data.message}`);
  }

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

export async function getTwitchStreams(twitchUsernames: string[]) {
  const token = await getAccessToken();

  const apiUrl = buildTwitchAPIUrl(twitchUsernames);

  const response = await fetch(apiUrl, {
    headers: {
      "Client-ID": CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TwitchAPIResponse = await response.json();

  return data.data
    .filter((twitchStream) => twitchStream.game_id == TWITCH_CS2_GAME_ID)
    .sort((a, b) => a.viewer_count - b.viewer_count);
}
