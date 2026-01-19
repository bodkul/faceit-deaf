"use client";

import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("teams")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!teamId,
  });
}

export function useEventTeams(eventId: string) {
  return useQuery({
    queryKey: ["event-teams", eventId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("event_teams")
        .select(`
          *,
          team:teams(*)
        `)
        .eq("event_id", eventId);

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}
