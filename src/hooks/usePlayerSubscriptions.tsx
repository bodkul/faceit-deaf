"use client";

import { Database, PlayerWithEloHistory } from "@/types/database";
import { supabase } from "@/lib/supabaseClient";
import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";
import { getDayAgo } from "@/lib/utils";

const dayAgo = getDayAgo();

export default function usePlayerSubscriptions() {
  const { data, isLoading } = useQuery(
    supabase
      .from<"players", Database["Tables"]["players"]>("players")
      .select("*, eloHistory (player_elo, created_at)")
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false })
      .returns<PlayerWithEloHistory[]>(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useSubscription(
    supabase,
    `public:players`,
    {
      event: "*",
      table: "players",
      schema: "public",
    },
    ["id"]
  );

  useSubscription(
    supabase,
    `public:eloHistory`,
    {
      event: "*",
      table: "eloHistory",
      schema: "public",
    },
    ["id"]
  );

  return { data, isLoading } as const;
}
