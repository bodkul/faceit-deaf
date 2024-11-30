import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
import { logger } from "@/lib/logger";

type EloHistory = Database["Tables"]["eloHistory"]["Insert"];

export async function insertEloHistory(rows: EloHistory[]) {
  const { error } = await supabase
    .from<"eloHistory", Database["Tables"]["eloHistory"]>("eloHistory")
    .insert(rows);

  if (error) {
    logger.error(`Failed to insert elo history: ${error}`);
  }
}
