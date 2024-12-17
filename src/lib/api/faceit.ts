import { faceitApiConfig } from "@/lib/config";
import { logger } from "@/lib/logger";
import type { Player } from "@/types/api";

export async function fetchFaceitData<T>(url: string): Promise<T> {
  const response = await fetch(`${faceitApiConfig.URL}${url}`, {
    headers: {
      Authorization: `Bearer ${faceitApiConfig.TOKEN}`,
    },
  });

  if (!response.ok) {
    logger.error(`Error fetching data from ${url}: ${response.statusText}`);
    throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchPlayer(playerId: string) {
  return await fetchFaceitData<Player>(`/players/${playerId}`);
}

export async function fetchPlayers(playerIds: string[]) {
  return Promise.all(playerIds.map(fetchPlayer));
}
