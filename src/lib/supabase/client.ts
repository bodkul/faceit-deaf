import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function createSupabaseClient(supabaseAccessToken?: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseAccessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseAccessToken}`,
            },
          },
        }
      : undefined,
  );
}
