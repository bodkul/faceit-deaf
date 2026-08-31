import { useQuery } from "@tanstack/react-query";

import { supabaseClient } from "@/lib/supabase";

export function useEventsCount() {
  return useQuery({
    queryKey: ["events-count"],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { count } = await supabaseClient
        .from("events")
        .select("*", { count: "exact", head: true })
        .or(`end_date.gte.${now},end_date.is.null`)
        .throwOnError();

      return count;
    },
  });
}
