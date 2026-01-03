import { useSubscription } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

export function usePlayersSubscription(callback: () => Promise<void>) {
  return useSubscription(
    supabaseClient,
    "players_subscription",
    {
      event: "*",
      table: "players",
      schema: "public",
    },
    ["id"],
    {
      callback,
    },
  );
}
