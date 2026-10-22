import { keyBy, mapAsync } from "es-toolkit";
import { after } from "next/server";

import { faceit } from "@/lib/faceit/client";
import type { MatchPayload } from "@/lib/faceit/webhooks/types";
import { broadcast } from "@/lib/realtime/broadcast";
import { topics } from "@/lib/realtime/topics";
import {
  deleteMatch,
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
} from "@/lib/supabase/mutations";

import { getMatchId, getPlayerIds } from "../utils";

export async function handleMatchStatusReady(payload: MatchPayload) {
  const match = await faceit.matches.getMatchDetails(payload.id);

  if (match.calculate_elo !== true) return;

  const matchId = getMatchId(payload);
  const existingPlayers = await getExistingPlayers(getPlayerIds(payload));
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

      await upsertMatchTeamPlayers(
        team.roster.map((player) => ({
          match_team_id: resTeam.id,
          player_id_nullable: existingPlayerById[player.id] ? player.id : null,
          player_id_mandatory: player.id,
          nickname: player.nickname,
          game_skill_level: player.game_skill_level,
          elo_before: existingPlayerById[player.id]?.faceit_elo,
        })),
      );
    },
    { concurrency: 3 },
  );

  after(() => broadcast(matchTopics(matchId, payload)));
}

export async function handleMatchStatusCancelled(payload: MatchPayload) {
  const matchId = getMatchId(payload);
  await deleteMatch(matchId);
  after(() => broadcast(matchTopics(matchId, payload)));
}

function matchTopics(matchId: string, payload: MatchPayload) {
  return [
    topics.match(matchId),
    topics.liveMatches,
    ...getPlayerIds(payload).map(topics.player),
  ];
}
