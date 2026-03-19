"use client";

import { useQuery } from "@tanstack/react-query";
import ky from "ky";

type TwitchStreams = {
  streamingPlayers: {
    id: string;
    nickname: string;
    twitch_login: string | null;
  }[];
};

export function useLiveStreams() {
  return useQuery({
    queryKey: ["live-streams"],
    queryFn: async () => {
      const { streamingPlayers = [] } =
        await ky("/api/streams").json<TwitchStreams>();
      return streamingPlayers;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
