import { tasks } from "@trigger.dev/sdk";
import pMap from "p-map";

import { fetchMatch } from "@/lib/faceit/api";
import type { MatchPayload, MatchStatusEvent } from "@/lib/faceit/match-events";
import {
  deleteMatch,
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
} from "@/lib/supabase/mutations";
import { syncFinishedMatchTask } from "@/trigger/update-match";

async function handleMatchStatusReady(payload: MatchPayload) {
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

async function handleMatchStatusCancelled(payload: MatchPayload) {
  const matchId = payload.id.replace(/^1-/, "");
  await deleteMatch(matchId);
}

export async function handleMatchStatusEvent(body: MatchStatusEvent) {
  console.info(`Handling match status event: ${body.event}`, body.payload);

  if (
    body.payload.game !== "cs2" ||
    body.payload.region !== "EU" ||
    body.payload.organizer_id !== "faceit" ||
    body.payload.entity.id !== "f4148ddd-bce8-41b8-9131-ee83afcdd6dd"
  ) {
    return;
  }

  switch (body.event) {
    case "match_status_ready":
      await handleMatchStatusReady(body.payload);
      break;
    case "match_status_cancelled":
      await handleMatchStatusCancelled(body.payload);
      break;
    case "match_status_finished":
      try {
        await tasks.trigger<typeof syncFinishedMatchTask>(
          "sync-finished-match",
          body.payload,
        );
        console.log("Task triggered successfully");
      } catch (err) {
        console.error("Error triggering task", err);
      }
      break;
  }
}
