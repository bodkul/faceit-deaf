import ky from "ky";
import { type NextRequest, NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

// Helix accepts at most 100 user_id per request; one account per player keeps
// us under it.
const MAX_PLAYERS = 100;

let appToken: { value: string; expiresAt: number } | undefined;

// App tokens live ~60 days; reuse one while the instance stays warm instead of
// minting a new one per request.
async function getTwitchAppToken() {
  if (appToken && appToken.expiresAt > Date.now()) return appToken.value;

  const { access_token, expires_in } = await ky
    .post("https://id.twitch.tv/oauth2/token", {
      json: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    })
    .json<{ access_token: string; expires_in: number }>();

  appToken = {
    value: access_token,
    expiresAt: Date.now() + (expires_in - 60) * 1000,
  };
  return access_token;
}

export async function GET(request: NextRequest) {
  const nicknames = [
    ...new Set(request.nextUrl.searchParams.getAll("nickname")),
  ].slice(0, MAX_PLAYERS);

  if (!nicknames.length) return json([]);

  const { data: players } = await supabase
    .from("players")
    .select("id, nickname, auth_user_id")
    .in("nickname", nicknames)
    .not("auth_user_id", "is", null);

  const playerByUserId = new Map(
    (players ?? []).map((p) => [p.auth_user_id as string, p]),
  );
  if (!playerByUserId.size) return json([]);

  const { data: accounts } = await createAdminClient()
    .schema("next_auth")
    .from("accounts")
    .select("providerAccountId, userId")
    .eq("provider", "twitch")
    .in("userId", [...playerByUserId.keys()]);

  if (!accounts?.length) return json([]);

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

  const streamingPlayers = liveStreams.flatMap((stream) => {
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

  return json(streamingPlayers);
}

// Every open page polls this each minute; let the CDN serve repeats of the same
// player set instead of hitting the database and Twitch per visitor.
function json(
  streamingPlayers: { id: string; nickname: string; twitch_login: string }[],
) {
  return NextResponse.json(
    { streamingPlayers },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
      },
    },
  );
}
