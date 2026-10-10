import { subDays } from "date-fns";

import { createClient } from "@/lib/supabase/server";

/** Finished tracked matches: all time and over the last 30 days. */
export async function getMatchCounts() {
  const supabase = createClient();
  const monthAgo = subDays(new Date(), 30).toISOString();

  const [total, month] = await Promise.all([
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "FINISHED")
      .throwOnError(),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("status", "FINISHED")
      .gte("finished_at", monthAgo)
      .throwOnError(),
  ]);

  return { total: total.count ?? 0, month: month.count ?? 0 };
}
