import { useSubscription } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export function useMatchesSubscription(callback: () => Promise<void>) {
  return useSubscription(
    supabase,
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
