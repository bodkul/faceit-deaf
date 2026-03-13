import { useQuery } from "@tanstack/react-query";
import type { Match } from "faceit-sdk/hubs";
import type { MatchStats } from "faceit-sdk/matches";

import { faceitSdk } from "@/lib/faceit";

export const HUB_IDS = [
  "ea94cb7c-7b9f-49fc-9746-64916567e538",
  "05049049-fdf3-4d5b-afc9-a6818f86064a",
];

export type TournamentMatch = Match & { matchStats: MatchStats | null };

export function useTournamentData() {
  return useQuery({
    queryKey: ["tournament"],
    queryFn: async () => {
      const allItems: Match[] = [];

      await Promise.all(
        HUB_IDS.map(async (hubId) => {
          const limit = 100;
          let offset = 0;
          let hasMore = true;
          while (hasMore) {
            const { items } = await faceitSdk.hubs.getHubMatches(hubId, {
              type: "all",
              offset,
              limit,
            });
            allItems.push(...items);
            if (items.length < limit) hasMore = false;
            else offset += limit;
          }
        }),
      );

      const finished = allItems.filter((m) => m.status === "FINISHED");
      const statsResults = await Promise.all(
        finished.map(
          (m) =>
            faceitSdk.matches
              .getMatchStats(m.match_id)
              .catch(() => null) as Promise<MatchStats | null>,
        ),
      );

      const statsMap = new Map<string, MatchStats | null>();
      for (let i = 0; i < finished.length; i++) {
        statsMap.set(finished[i].match_id, statsResults[i] ?? null);
      }

      const matches: TournamentMatch[] = allItems.map((m) => ({
        ...m,
        matchStats: statsMap.get(m.match_id) ?? null,
      }));

      return matches;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
