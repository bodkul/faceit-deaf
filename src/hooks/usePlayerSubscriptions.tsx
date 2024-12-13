"use client";

import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";

import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabaseClient";
import { getDayAgo } from "@/lib/utils";

const dayAgo = getDayAgo();

export default function usePlayerSubscriptions() {
  const { data, mutate, isLoading } = useQuery(
    supabase
      .from("players")
      .select("*, eloHistory (*)")
      .gt("eloHistory.created_at", dayAgo.toISOString())
      .limit(1, { referencedTable: "eloHistory" })
      .order("faceit_elo", { ascending: false }),
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
