import { fromUnixTime } from "date-fns";

import { fetchMatch, fetchMatchStats, fetchPlayers } from "@/lib/faceit/api";
import type { MatchPayload, MatchStatusEvent } from "@/lib/faceit/match-events";
import {
  addEloHistory,
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
  upsertPlayers,
} from "@/lib/supabase/mutations";

async function handleMatchStatusFinished(payload: MatchPayload) {
  const matchId = payload.id.replace(/^1-/, "");
  const playerIds = payload.teams.flatMap((team) =>
    team.roster.map((player) => player.id),
  );

  const existingPlayers = await getExistingPlayers(playerIds);
  const existingPlayerIds = existingPlayers.map((player) => player.id);

  await addEloHistory(
    existingPlayers.map((player) => ({
      player_id: player.id,
      player_elo: player.faceit_elo,
    })),
  );

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

  const match = await fetchMatch(payload.id);
  console.log(match);

  const matchStats = await fetchMatchStats(payload.id);
  console.log(matchStats);

  const round = matchStats.rounds[0];

  await upsertMatch({
    id: matchId,
    game: match.game,
    region: match.region,
    competition_id: match.competition_id,
    organizer_id: match.organizer_id,
    location_pick: match.voting.location?.pick[0],
    map_pick: match.voting.map?.pick[0],
    started_at: fromUnixTime(Number(match.started_at)).toISOString(),
    finished_at: fromUnixTime(Number(match.finished_at)).toISOString(),
    demo_url: match.demo_url[0],
    status: match.status,
    faceit_url: match.faceit_url,
    round_score: round.round_stats.Score,
  });

  for (const team of payload.teams) {
    const roundTeam = round.teams.find((rt) => rt.team_id === team.id);
    const stats = (roundTeam?.team_stats as Record<string, string>) ?? {};

    const resTeam = await upsertMatchTeam({
      match_id: matchId,
      team_id: team.id,
      name: team.name,
      avatar: team.avatar,
      leader: team.leader_id,
      first_half_score: Number(stats["First Half Score"]),
      second_half_score: Number(stats["Second Half Score"]),
      overtime_score: Number(stats["Overtime score"]),
      final_score: Number(stats["Final Score"]),
      team_win: stats["Team Win"] === "1",
      team_headshots: Number(stats["Team Headshots"]),
    });

    await upsertMatchTeamPlayers(
      team.roster.map((player) => {
        const qwe = roundTeam?.players.find((p) => p.player_id === player.id);

        return {
          match_team_id: resTeam.id,
          player_id_nullable: existingPlayerIds.includes(player.id)
            ? player.id
            : null,
          player_id_mandatory: player.id,
          nickname: player.nickname,
          avatar: player.avatar,
          membership: player.membership,
          game_player_id: player.game_id,
          game_player_name: player.game_name,
          game_skill_level: player.game_skill_level,
          anticheat_required: player.anticheat_required,
          player_stats: qwe?.player_stats,
        };
      }),
    );
  }
}

export async function handleMatchStatusEvent(body: MatchStatusEvent) {
  console.info(`Handling match status event: ${body.event}`, body.payload);

  if (
    body.payload.organizer_id !== "faceit" ||
    body.payload.entity.id !== "f4148ddd-bce8-41b8-9131-ee83afcdd6dd"
  ) {
    return;
  }

  switch (body.event) {
    case "match_status_finished":
      await handleMatchStatusFinished(body.payload);
      break;
  }
}
