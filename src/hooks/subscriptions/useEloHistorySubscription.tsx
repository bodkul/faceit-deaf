import { useSubscription } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabaseClient";

export default function useEloHistorySubscription(
  callback: () => Promise<void>,
) {
  return useSubscription(
    supabase,
    "eloHistory_subscription",
    {
      event: "*",
      table: "eloHistory",
      schema: "public",
    },
    ["id"],
    {
      callback,
    },
  );
}
