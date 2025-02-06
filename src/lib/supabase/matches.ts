import { supabase } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/types";

export async function upsertMatch(match: TablesInsert<"matches">) {
  const { error } = await supabase.from("matches").upsert(match);

  if (error) {
    console.info("Error upserting match into matches table", error);
  }
}
