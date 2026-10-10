"use client";

import { useQuery } from "@tanstack/react-query";

import { getLiveStreams } from "@/features/match/actions";

export function useLiveStreams(nicknames: string[]) {
  // Sorted so the same players share one query.
  const players = [...new Set(nicknames)].sort();

  return useQuery({
    queryKey: ["live-streams", players],
    queryFn: () => getLiveStreams(players),
    enabled: players.length > 0,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
