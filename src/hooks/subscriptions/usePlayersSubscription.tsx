import { useSubscription } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabaseClient";

export default function usePlayersSubscription(callback: () => Promise<void>) {
  return useSubscription(
    supabase,
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
