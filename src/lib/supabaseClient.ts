import { createClient } from "@supabase/supabase-js";

import { supabaseConfig } from "@/lib/config";
import type { Database } from "@/types/database";

export const supabase = createClient<Database>(
  supabaseConfig.URL,
  supabaseConfig.ANON_KEY,
);
