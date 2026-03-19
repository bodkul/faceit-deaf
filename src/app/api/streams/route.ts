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

  if (!accounts?.length) return NextResponse.json({ streams: [] });

  const twitchIds = accounts.map((a) => a.providerAccountId);
  const token = await getTwitchAppToken();

  const params = new URLSearchParams();
  for (const id of twitchIds) params.append("user_id", id);

  const { data } = await ky
    .get("https://api.twitch.tv/helix/streams", {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
      searchParams: params,
    })
    .json<{ data: { user_id: string; user_login: string }[] }>();
  const liveIds = (data ?? []).map((s: { user_id: string }) => s.user_id);

  const { data: players } = await supabaseClient
    .from("players")
    .select("id, nickname")
    .in(
      "auth_user_id",
      accounts
        .filter((a) => liveIds.includes(a.providerAccountId))
        .map((a) => a.userId),
    );

  return NextResponse.json({ streamingPlayers: players ?? [] });
}
