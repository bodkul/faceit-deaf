import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import type { TypedSupabaseClient } from "./types";

let client: TypedSupabaseClient | undefined;

/**
 * Read-only client for server components and route handlers. Sign-in goes
 * through NextAuth, not Supabase Auth, so there is no session to read from
 * cookies — and reading them would opt cached pages into dynamic rendering.
 */
export function createClient() {
  client ??= createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
