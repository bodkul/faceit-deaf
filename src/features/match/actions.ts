"use server";

import ky from "ky";
import { unstable_cache } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Helix accepts at most 100 user_id per request; one account per player keeps
// us under it.
const MAX_PLAYERS = 100;

// App tokens live ~60 days; share one across instances for a day instead of
// minting a new one per lookup.
const getTwitchAppToken = unstable_cache(
  async () => {
    const { access_token } = await ky
      .post("https://id.twitch.tv/oauth2/token", {
        json: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      })
      .json<{ access_token: string }>();
    return access_token;
  },
  ["twitch-app-token"],
  { revalidate: 60 * 60 * 24 },
);

// Every open page polls each minute; serve the same player set from the cache
// instead of hitting the database and Twitch per visitor.
const fetchLiveStreams = unstable_cache(
  async (nicknames: string[]) => {
    const { data: players } = await createClient()
      .from("players")
      .select("id, nickname, auth_user_id")
      .in("nickname", nicknames)
      .not("auth_user_id", "is", null);

    const playerByUserId = new Map(
      (players ?? []).map((p) => [p.auth_user_id as string, p]),
    );
    if (!playerByUserId.size) return [];

    const { data: accounts } = await createAdminClient()
      .schema("next_auth")
      .from("accounts")
      .select("providerAccountId, userId")
      .eq("provider", "twitch")
      .in("userId", [...playerByUserId.keys()]);

    if (!accounts?.length) return [];

    const params = new URLSearchParams({ first: String(MAX_PLAYERS) });
    for (const { providerAccountId } of accounts) {
      params.append("user_id", providerAccountId);
    }

    const { data: liveStreams } = await ky
      .get("https://api.twitch.tv/helix/streams", {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${await getTwitchAppToken()}`,
        },
        searchParams: params,
      })
      .json<{ data: { user_id: string; user_login: string }[] }>();

    const userIdByTwitchId = new Map(
      accounts.map((a) => [a.providerAccountId, a.userId]),
    );

    return liveStreams.flatMap((stream) => {
      const userId = userIdByTwitchId.get(stream.user_id);
      const player = userId && playerByUserId.get(userId);
      return player
        ? [
            {
              id: player.id,
              nickname: player.nickname,
              twitch_login: stream.user_login,
            },
          ]
        : [];
    });
  },
  ["live-streams"],
  { revalidate: 60 },
);

/** Players among `nicknames` who are live on Twitch right now. */
export async function getLiveStreams(nicknames: string[]) {
  // Server functions are public endpoints; don't trust the payload's shape.
  if (!Array.isArray(nicknames)) return [];

  // Normalized so the same players share one cache entry.
  const players = [...new Set(nicknames.filter((n) => typeof n === "string"))]
    .sort()
    .slice(0, MAX_PLAYERS);
  if (!players.length) return [];
  return fetchLiveStreams(players);
}
