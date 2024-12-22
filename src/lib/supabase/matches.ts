import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase/client";
import type { TablesInsert } from "@/lib/supabase/types";

export async function upsertMatch(match: TablesInsert<"matches">) {
  const { error } = await supabase.from("matches").upsert(match);

  if (error) {
    logger.info("Error upserting match into matches table", error);
  }
}
