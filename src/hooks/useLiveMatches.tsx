"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useLiveMatches() {
  const { mutate, ...query } = useQuery(
    supabase
      .from("live_matches")
      .select()
      .order("status", { ascending: false })
      .order("started_at", { ascending: false }),
  );

  supabase
    .channel("live-matches")
    .on("broadcast", { event: "*" }, () => mutate().then())
    .subscribe();

  return query;
}
