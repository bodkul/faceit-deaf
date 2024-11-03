import { fetchPlayersWithStats } from "@/lib/api/faceit";
import { insertEloHistory } from "@/lib/database/eloHistory";
import { getPlayersByIds, upsertPlayers } from "@/lib/database/players";

interface Payload {
  teams: {
    roster: {
      id: string;
    }[];
  }[];
}

export const handleMatchFinished = async (payload: Payload) => {
  const playerIds = payload.teams.flatMap((team) =>
    team.roster.map((player) => player.id)
  );

  const existingPlayers = await getPlayersByIds(playerIds);

  await insertEloHistory(
    existingPlayers.flatMap((player) => ({
      player_id: player.id,
      player_elo: player.faceit_elo,
    }))
  );

  const players = await fetchPlayersWithStats(
    existingPlayers.flatMap((player) => player.id)
  );
  await upsertPlayers(players);
};
