"use client";

import { Database, PlayerWithEloHistory } from "@/types/database";
import { supabase } from "@/lib/supabaseClient";
import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";
import { getDayAgo } from "@/lib/utils";
import { logger } from "@/lib/logger";

const dayAgo = getDayAgo();

export default function usePlayerSubscriptions() {
  const { data, mutate, isLoading } = useQuery(
    supabase
      .from<"players", Database["Tables"]["players"]>("players")
      .select("*, eloHistory (player_elo, created_at)")
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false })
      .returns<PlayerWithEloHistory[]>(),
  );

  useSubscription(
    supabase,
    `public:players`,
    {
      event: "*",
      table: "players",
      schema: "public",
    },
    ["id"],
    {
      callback: (payload) => {
        mutate();
        logger.info("Subscription with players", payload);
      },
    },
  );

  useSubscription(
    supabase,
    `public:eloHistory`,
    {
      event: "*",
      table: "eloHistory",
      schema: "public",
    },
    ["id"],
    {
      callback: (payload) => {
        mutate();
        logger.info("Subscription with eloHistory", payload);
      },
    },
  );

  return { data, isLoading } as const;
}
