"use client";

import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useLiveMatches() {
  const { mutate, ...query } = useQuery(
    supabase
      .from("live_matches")
      .select()
      .order("started_at", { ascending: false }),
  );

  useSubscription(
    supabase,
    "live_matches_subscription",
    {
      event: "*",
      table: "matches",
      schema: "public",
    },
    ["id"],
    {
      callback: () => mutate().then(),
    },
  );

  return query;
}
