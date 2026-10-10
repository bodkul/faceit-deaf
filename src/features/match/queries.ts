import { startOfMonth } from "date-fns";

import { createClient } from "@/lib/supabase/server";

/** Finished tracked matches: all time and since the start of this month. */
export async function getMatchCounts() {
  const supabase = createClient();
  const monthStart = startOfMonth(new Date()).toISOString();

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
      .gte("finished_at", monthStart)
      .throwOnError(),
  ]);

  return { total: total.count ?? 0, month: month.count ?? 0 };
}
