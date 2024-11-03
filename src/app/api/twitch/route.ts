import { NextResponse } from "next/server";

const CLIENT_ID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID as string;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET as string;
const TWITCH_PLAYERS = (process.env.NEXT_PUBLIC_TWITCH_PLAYERS || "").split(
  ","
);

interface TwitchStream {
  id: string;
  user_name: string;
  title: string;
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

export async function GET() {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_PLAYERS.join(
        "&user_login="
      )}`,
      {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data: TwitchAPIResponse = await response.json();

    return NextResponse.json(data.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ошибка при получении трансляций" },
      { status: 500 }
    );
  }
}
