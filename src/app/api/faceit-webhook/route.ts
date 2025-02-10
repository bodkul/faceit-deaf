import { NextRequest, NextResponse } from "next/server";

import { fetchPlayers } from "@/lib/faceit/api";
import { type MatchStatusEvent } from "@/lib/faceit/match-events";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body: MatchStatusEvent = await req.json();

  console.info("Match status event", body);

  const playerIds = body.payload.teams.flatMap((team) =>
    team.roster.map((player) => player.id),
  );

  const { data: existingPlayers, error: existingPlayersError } = await supabase
    .from("players")
    .select("id, faceit_elo")
    .in("id", playerIds);

  if (existingPlayersError) {
    console.error(`Error fetching players by IDs: ${existingPlayersError}`);
  }

  if (existingPlayers) {
    const { error: eloHistoryError } = await supabase.from("eloHistory").insert(
      existingPlayers.flatMap((player) => ({
        player_id: player.id,
        player_elo: player.faceit_elo,
      })),
    );

    if (eloHistoryError) {
      console.error(`Failed to insert elo history: ${eloHistoryError}`);
    }

    const players = await fetchPlayers(
      existingPlayers.flatMap((player) => player.id),
    );

    const { error: playersError } = await supabase.from("players").upsert(
      players.map((player) => ({
        id: player.player_id,
        avatar: player.avatar,
        nickname: player.nickname,
        skill_level: player.games.cs2.skill_level,
        faceit_elo: player.games.cs2.faceit_elo,
        faceit_url: player.faceit_url,
        steam_id_64: player.steam_id_64,
      })),
    );

    if (playersError) {
      console.error("Failed to upsert players", playersError);
    }
  }

  return NextResponse.json({ message: "OK" });
}
