import { logger } from "@/lib/logger";

import twitchClient from "./client";
import type { TwitchTokenResponse } from "./types";

export async function fetchTwitchAccessToken(): Promise<string> {
  try {
    const response = await twitchClient.post<TwitchTokenResponse>(
      "https://id.twitch.tv/oauth2/token",
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET!,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    return response.data.access_token;
  } catch (error) {
    logger.error("Failed to fetch Twitch access token:", error);
    throw new Error("Unable to fetch Twitch access token");
  }
}
