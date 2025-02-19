import { fetchPlayers } from "@/lib/faceit/api";
import { type MatchStatusEvent } from "@/lib/faceit/match-events";
import {
  addEloHistory,
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
  upsertPlayers,
} from "@/lib/supabase/mutations";

async function handleMatchStatusFinished(body: MatchStatusEvent) {
  const matchId = body.payload.id.replace(/^1-/, "");
  const playerIds = body.payload.teams.flatMap((team) =>
    team.roster.map((player) => player.id),
  );

  const existingPlayers = await getExistingPlayers(playerIds);
  await addEloHistory(
    existingPlayers.map((player) => ({
      player_id: player.id,
      player_elo: player.faceit_elo,
    })),
  );

  const existingPlayerIds = existingPlayers.map((player) => player.id);
  const players = await fetchPlayers(existingPlayerIds);

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
    id: matchId,
    organizer_id: body.payload.organizer_id,
    region: body.payload.region,
    game: body.payload.game,
    competition_id: body.payload.entity.id,
    started_at: body.payload.started_at,
    finished_at: body.payload.finished_at,
  });

  for (const team of body.payload.teams) {
    const resTeam = await upsertMatchTeam({
      match_id: matchId,
      team_id: team.id,
      name: team.name,
      avatar: team.avatar,
      leader: team.leader_id,
    });

    await upsertMatchTeamPlayers(
      team.roster.map((player) => ({
        match_team_id: resTeam.id,
        player_id_nullable: existingPlayerIds.includes(player.id)
          ? player.id
          : null,
        player_id_mandatory: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        membership: player.membership,
        game_player_id: parseInt(player.game_id),
        game_player_name: player.game_name,
        game_skill_level: player.game_skill_level,
        anticheat_required: player.anticheat_required,
      })),
    );
  }
}

export async function handleMatchStatusEvent(body: MatchStatusEvent) {
  console.info("Received match status event", body);

  const isTargetOrganizer =
    body.payload.organizer_id === "faceit" &&
    body.payload.entity.id === "f4148ddd-bce8-41b8-9131-ee83afcdd6dd";

  if (!isTargetOrganizer) return;

  switch (body.event) {
    case "match_status_finished":
      await handleMatchStatusFinished(body);
      break;
  }
}
