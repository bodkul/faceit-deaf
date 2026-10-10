import { subDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";

/** Finished tracked matches: all time and over the last 7 days. */
export async function getMatchCounts() {
  const supabase = createClient();
  const weekAgo = subDays(new Date(), 7).toISOString();

  const [total, week] = await Promise.all([
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "FINISHED")
      .throwOnError(),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "FINISHED")
      .gte("finished_at", weekAgo)
      .throwOnError(),
  ]);

  return { total: total.count ?? 0, week: week.count ?? 0 };
}
