"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabaseClient";
import { getDayAgo } from "@/lib/utils";

const dayAgo = getDayAgo();

export default function usePlayers() {
  return useQuery(
    supabase
      .from("players")
      .select("*, eloHistory (*)")
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false }),
  );
}
