import { Player, PlayerStats, PlayerWithStats } from "@/types/api";
import { faceitApiConfig } from "@/lib/config";

async function fetchFaceitData<T>(url: string): Promise<T> {
  const response = await fetch(`${faceitApiConfig.URL}${url}`, {
    headers: {
      Authorization: `Bearer ${faceitApiConfig.TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(`Error fetching data from ${url}: ${response.statusText}`);
    throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPlayer(playerId: string): Promise<Player> {
  return await fetchFaceitData<Player>(`/players/${playerId}`);
}

export async function fetchPlayerStats(playerId: string) {
  return await fetchFaceitData<PlayerStats>(`/players/${playerId}/stats/cs2`);
}

export async function fetchPlayersWithStats(
  playerIds: string[]
): Promise<PlayerWithStats[]> {
  return Promise.all(
    playerIds.map(async (playerId) => {
      const player = await fetchPlayer(playerId);
      const playerStats = await fetchPlayerStats(playerId);
      return { ...player, ...playerStats };
    })
  );
}
