import { useQuery } from "@tanstack/react-query";

import { useRealtime } from "@/hooks/use-realtime";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useEventsCount() {
  useRealtime(["events-count"], [{ table: "events" }]);

  return useQuery({
    queryKey: ["events-count"],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { count } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .or(`end_date.gte.${now},end_date.is.null`)
        .throwOnError();

      return count;
    },
  });
}
