import ky from "ky";
import { NextResponse } from "next/server";

import { supabaseClient } from "@/lib/supabase";
import { supabaseAuth } from "@/lib/supabase/auth";

async function getTwitchAppToken() {
  const res = await ky
    .post("https://id.twitch.tv/oauth2/token", {
      json: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    })
    .json<{ access_token: string }>();
  return res.access_token;
}

export async function GET() {
  const { data: accounts } = await supabaseAuth
    .from("accounts")
    .select("providerAccountId, userId")
    .eq("provider", "twitch");

  if (!accounts?.length) return NextResponse.json({ streamingPlayers: [] });

  const token = await getTwitchAppToken();

  const params = new URLSearchParams();
  for (const { providerAccountId } of accounts) {
    params.append("user_id", providerAccountId);
  }

  const { data: liveStreams } = await ky
    .get("https://api.twitch.tv/helix/streams", {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      searchParams: params,
    })
    .json<{ data: { user_id: string; user_login: string }[] }>();

  // auth user id → twitch login of a currently live stream
  const loginByUserId = new Map<string, string>();
  for (const stream of liveStreams) {
    const account = accounts.find(
      (a) => a.providerAccountId === stream.user_id,
    );
    if (account) loginByUserId.set(account.userId, stream.user_login);
  }

  if (!loginByUserId.size) return NextResponse.json({ streamingPlayers: [] });

  const { data: players } = await supabaseClient
    .from("players")
    .select("id, nickname, auth_user_id")
    .in("auth_user_id", [...loginByUserId.keys()]);

  const streamingPlayers = (players ?? []).map(
    ({ auth_user_id, ...player }) => ({
      ...player,
      twitch_login: (auth_user_id && loginByUserId.get(auth_user_id)) ?? null,
    }),
  );

  return NextResponse.json({ streamingPlayers });
}
