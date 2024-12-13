import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabaseClient";
import type { TablesInsert } from "@/types/database";

export async function insertEloHistory(rows: TablesInsert<"eloHistory">[]) {
  const { error } = await supabase.from("eloHistory").insert(rows);

  if (error) {
    logger.error(`Failed to insert elo history: ${error}`);
  }
}
