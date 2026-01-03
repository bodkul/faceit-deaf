"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { MatchHistoryTableRow } from "@/app/player/[username]/_components/MatchHistoryTableRow";
import { supabaseClient } from "@/lib/supabase";

import { RecentMatchesLayout } from "./layout";
import { RecentMatchesLoading } from "./loading";

export function useRecentMatches(playerId: string) {
  return useQuery({
    queryKey: ["recent-matches", playerId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select("*")
        .match({ player_id: playerId })
        .order("finished_at", { ascending: false })
        .limit(10);

      return data;
    },
  });
}

export function RecentMatches({ playerId }: { playerId: string }) {
  const { data, isLoading } = useRecentMatches(playerId);

  const rows = useMemo(() => {
    if (!data?.length) return null;

    return data.map((match) => (
      <MatchHistoryTableRow key={match.id} match={match} />
    ));
  }, [data]);

  if (isLoading) return <RecentMatchesLoading />;

  return <RecentMatchesLayout>{rows}</RecentMatchesLayout>;
}
