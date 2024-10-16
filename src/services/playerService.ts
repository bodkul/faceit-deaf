import { fetchPlayers } from "@/lib/api";
import { playersExist, upsertPlayers } from "@/lib/database/players";

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

  const existingPlayers = await playersExist(playerIds);
  const players = await fetchPlayers(existingPlayers);
  await upsertPlayers(players);
};
