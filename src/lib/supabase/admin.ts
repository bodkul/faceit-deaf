import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { TypedSupabaseClient } from "./types";

let client: TypedSupabaseClient | undefined;

/**
 * Service-role client for writes (webhooks, cron routes, Trigger.dev tasks)
 * and the `next_auth` schema. Bypasses RLS — never import from client code.
 */
export function createAdminClient() {
  client ??= createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
