import { Player, PlayerStats, PlayerWithStats } from "@/types/api";

interface HubMember {
  user_id: string;
  nickname: string;
  avatar: string;
  faceit_url: string;
}

interface HubMembersResponse {
  items: HubMember[];
}

async function fetchFaceitData<T>(url: string): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(`Error fetching data from ${url}: ${response.statusText}`);
    throw new Error(`Error fetching data from ${url}: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchHubMembers(hubId: string): Promise<HubMember[]> {
  const offsets = [0, 50];
  const members = await Promise.all(
    offsets.map((offset) =>
      fetchFaceitData<HubMembersResponse>(
        `/hubs/${hubId}/members?offset=${offset}`
      )
    )
  );

  return members.flatMap((data) => data.items);
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
