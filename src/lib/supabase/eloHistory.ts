import { supabase } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/types";

export async function insertEloHistory(rows: TablesInsert<"eloHistory">[]) {
  const { error } = await supabase.from("eloHistory").insert(rows);

  if (error) {
    console.error(`Failed to insert elo history: ${error}`);
  }
}
