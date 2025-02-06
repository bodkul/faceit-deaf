import { NextRequest, NextResponse } from "next/server";

import { fetchPlayers } from "@/lib/faceit/api";
import { type MatchStatusEvent } from "@/lib/faceit/match-events";
import { insertEloHistory } from "@/lib/supabase/eloHistory";
import { upsertMatch } from "@/lib/supabase/matches";
import { getPlayersByIds, upsertPlayers } from "@/lib/supabase/players";

export async function POST(req: NextRequest) {
  const body: MatchStatusEvent = await req.json();

  console.info("Match status event", body);

  const playerIds = body.payload.teams.flatMap((team) =>
    team.roster.map((player) => player.id),
  );

  const existingPlayers = await getPlayersByIds(playerIds);

  await insertEloHistory(
    existingPlayers.flatMap((player) => ({
      player_id: player.id,
      player_elo: player.faceit_elo,
    })),
  );

  const players = await fetchPlayers(
    existingPlayers.flatMap((player) => player.id),
  );

  await upsertPlayers(
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

  await upsertMatch({
    id: body.payload.id.replace(/^1-/, ""),
    game: body.payload.game,
    competition_id: body.payload.entity.id,
    region: body.payload.region,
    version: body.payload.version,
    organizer_id: body.payload.organizer_id,
    updated_at: body.payload.updated_at,
    created_at: body.payload.created_at,
  });

  return NextResponse.json({ message: "OK" });
}
