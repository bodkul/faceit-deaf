import { keyBy, mapAsync } from "es-toolkit";
import { NextResponse } from "next/server";

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

import { getMatchId, getPlayerIds } from "./utils";

export async function handleMatchStatusReady(payload: MatchPayload) {
  const matchId = getMatchId(payload);
  const playerIds = getPlayerIds(payload);

  const match = await fetchMatch(payload.id);

  if (match.calculate_elo !== true)
    return NextResponse.json({ message: "Ignored: not a valid match" });

  const existingPlayers = await getExistingPlayers(playerIds);
  const existingPlayerById = keyBy(existingPlayers, (p) => p.id);

  await upsertMatch({
    id: matchId,
    competition_id: match.competition_id,
    organizer_id: match.organizer_id,
    location_pick: match.voting.location?.pick[0],
    map_pick: match.voting.map?.pick[0],
    status: match.status.toUpperCase(),
  });

  await mapAsync(
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
            player_id_nullable: existingPlayerById[player.id]
              ? player.id
              : null,
            player_id_mandatory: player.id,
            nickname: player.nickname,
            game_skill_level: player.game_skill_level,
            elo_before: existingPlayerById[player.id]?.faceit_elo,
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
