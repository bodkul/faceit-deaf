"use client";

import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { useState } from "react";

import { usePagination } from "@/hooks/usePagination";
import { supabaseClient } from "@/lib/supabase";

const PAGE_SIZE = 20;

export function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);

  const pagination = usePagination(totalCount, PAGE_SIZE);

  const { data: players, ...rest } = useQuery({
    queryKey: ["players", pagination.pageIndex],
    queryFn: async () => {
      const start = pagination.pageOffset * PAGE_SIZE;
      const end = (pagination.pageOffset + 1) * PAGE_SIZE - 1;
      const { data, count } = await supabaseClient
        .from("players")
        .select("id, nickname, avatar, faceit_elo, country", {
          count: "exact",
        })
        .order("faceit_elo", { ascending: false })
        .range(start, end);

      setTotalCount(count ?? 0);

      return data ?? [];
    },
  });

  const { data: matchTeamPlayers } = useQuery({
    queryKey: ["match_team_players", players?.map((p) => p.id)],
    queryFn: async () => {
      if (!players) return [];

      const { data } = await supabaseClient
        .from("match_team_players")
        .select(
          "player_id:player_id_nullable, elo_before, match_teams!inner(matches!inner(finished_at))",
        )
        .in(
          "player_id_nullable",
          players.map((p) => p.id),
        )
        .not("player_id_nullable", "is", null)
        .not("elo_before", "is", null)
        .not("match_teams.matches.finished_at", "is", null)
        .gte(
          "match_teams.matches.finished_at",
          subDays(new Date(), 1).toISOString(),
        );

      return data ?? [];
    },
    enabled: !!players,
  });

  const firstMatchPerPlayer = new Map<
    string,
    NonNullable<typeof matchTeamPlayers>[number]
  >();

  matchTeamPlayers?.forEach((mtp) => {
    if (!mtp.player_id || !mtp.match_teams?.matches?.finished_at) return;

    const currentDate = new Date(mtp.match_teams.matches.finished_at).getTime();

    const existing = firstMatchPerPlayer.get(mtp.player_id);

    if (!existing) {
      firstMatchPerPlayer.set(mtp.player_id, mtp);
      return;
    }

    const finishedAt = existing.match_teams.matches.finished_at;
    if (!finishedAt) return;

    const existingDate = new Date(finishedAt).getTime();

    if (currentDate < existingDate) {
      firstMatchPerPlayer.set(mtp.player_id, mtp);
    }
  });

  const data = players?.map((player) => {
    const mtp = firstMatchPerPlayer.get(player.id);

    return {
      ...player,
      elo_before: mtp?.elo_before ?? null,
    };
  });

  return { ...pagination, data, ...rest };
}
