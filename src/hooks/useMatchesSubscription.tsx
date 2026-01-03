import { useSubscription } from "@supabase-cache-helpers/postgrest-swr";

import { supabaseClient } from "@/lib/supabase";

export function useMatchesSubscription(callback: () => Promise<void>) {
  return useSubscription(
    supabaseClient,
    "matches_subscription",
    {
      event: "*",
      table: "matches",
      schema: "public",
    },
    ["id"],
    {
      callback,
    },
  );
}
