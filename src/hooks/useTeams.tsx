"use client";

import { useQuery } from "@tanstack/react-query";
import { divide, subtract, sumBy } from "lodash-es";

import { supabaseClient } from "@/lib/supabase";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("teams")
        .select("*")
        .order("name", { ascending: true })
        .throwOnError();
      return data;
    },
  });
}

export function useTeam(teamId: string) {
  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("teams")
        .select(
          "*, roster:team_players(player:players!inner(id, nickname, avatar, country, stats:match_team_players!inner(kills, deaths, match_teams!inner(match:matches!inner(map_pick)))))",
        )
        .eq("id", teamId)
        .single()
        .throwOnError();

      return {
        ...data,
        roster: data.roster.map(({ player }) => {
          const kills = sumBy(player.stats, (stat) => stat.kills || 0);
          const deaths = sumBy(player.stats, (stat) => stat.deaths || 0);

          return {
            ...player,
            stats: {
              maps: player.stats.length,
              kdDiff: subtract(kills, deaths),
              kd: divide(kills, deaths),
            },
          };
        }),
      };
    },
  });

  return { team, isLoading };
}

export function useEventTeams(eventId: string) {
  return useQuery({
    queryKey: ["event-teams", eventId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("event_teams")
        .select(`
          *,
          team:teams(*)
        `)
        .eq("event_id", eventId)
        .throwOnError();
      return data;
    },
    enabled: !!eventId,
  });
}
