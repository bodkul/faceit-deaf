import { NextResponse } from "next/server";
import pMap from "p-map";

import { fetchMatch } from "@/lib/faceit/api";
import type { MatchPayload } from "@/lib/faceit/match-events";
import {
  deleteMatch,
  getExistingPlayers,
  supabaseClient,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
} from "@/lib/supabase";

import { getMatchId, getPlayerIds, isWingmanMatch } from "./utils";

export async function handleMatchStatusReady(payload: MatchPayload) {
  const matchId = getMatchId(payload);
  const playerIds = getPlayerIds(payload);

  const match = await fetchMatch(payload.id);

  console.log(`Fetched match:`, { match });

  if (isWingmanMatch(match))
    return NextResponse.json({ message: "Ignored: not a valid match" });

  const existingPlayers = await getExistingPlayers(playerIds);
  const existingPlayerIds = existingPlayers.map((p) => p.id);

  await upsertMatch({
    id: matchId,
    competition_id: match.competition_id,
    organizer_id: match.organizer_id,
    location_pick: match.voting.location?.pick[0],
    map_pick: match.voting.map?.pick[0],
    status: match.status.toUpperCase(),
  });

  await pMap(
    payload.teams,
    async (team, index) => {
      const resTeam = await upsertMatchTeam({
        match_id: matchId,
        team_id: team.id,
        name: team.name,
        avatar: team.avatar,
        faction: index === 0 ? 1 : 2,
      });

      if (resTeam) {
        await upsertMatchTeamPlayers(
          team.roster.map((player) => ({
            match_team_id: resTeam.id,
            player_id_nullable: existingPlayerIds.includes(player.id)
              ? player.id
              : null,
            player_id_mandatory: player.id,
            nickname: player.nickname,
            game_skill_level: player.game_skill_level,
            elo_before: existingPlayers.find((p) => p.id === player.id)
              ?.faceit_elo,
          })),
        );
      }
    },
    { concurrency: 3 },
  );

  await supabaseClient.channel(`match:${matchId}`).httpSend("*", {});
}

export async function handleMatchStatusCancelled(payload: MatchPayload) {
  const matchId = getMatchId(payload);
  await deleteMatch(matchId);
}
