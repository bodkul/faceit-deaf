"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";

type TwitchStreams = {
  streamingPlayers: {
    id: string;
    nickname: string;
    twitch_login: string;
  }[];
};

export function useLiveStreams(nicknames: string[]) {
  // Sorted so the same players share one query and one CDN-cached URL.
  const players = [...new Set(nicknames)].sort();

  return useQuery({
    queryKey: ["live-streams", players],
    queryFn: async () => {
      const searchParams = new URLSearchParams(
        players.map((nickname) => ["nickname", nickname]),
      );
      const { streamingPlayers } = await ky("/api/streams", {
        searchParams,
      }).json<TwitchStreams>();
      return streamingPlayers;
    },
    enabled: players.length > 0,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
