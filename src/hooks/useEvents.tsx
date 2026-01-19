"use client";

import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { now } from "lodash-es";

import { supabaseClient } from "@/lib/supabase";

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .gte("end_date", formatISO(now()))
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function usePastEvents() {
  return useQuery({
    queryKey: ["events", "past"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .lt("end_date", formatISO(now()))
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
