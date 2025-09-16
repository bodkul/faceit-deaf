import pMap from "p-map";

import { fetchMatch } from "@/lib/faceit/api";
import type { MatchPayload } from "@/lib/faceit/match-events";
import {
  deleteMatch,
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
} from "@/lib/supabase/mutations";

export async function handleMatchStatusReady(payload: MatchPayload) {
  const matchId = payload.id.replace(/^1-/, "");
  const playerIds = payload.teams.flatMap((team) =>
    team.roster.map((p) => p.id),
  );

  const [existingPlayers, match] = await Promise.all([
    getExistingPlayers(playerIds),
    fetchMatch(payload.id),
  ]);

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
}

export async function handleMatchStatusCancelled(payload: MatchPayload) {
  const matchId = payload.id.replace(/^1-/, "");
  await deleteMatch(matchId);
}
