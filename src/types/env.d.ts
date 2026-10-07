declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase - Public (client-side)
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;

      // Supabase - Server-only (CRITICAL: Never expose to client)
      SUPABASE_SERVICE_ROLE_KEY: string;

      // FACEIT - Server-only
      FACEIT_API_TOKEN: string;
      FACEIT_CLIENT_ID: string;
      FACEIT_CLIENT_SECRET: string;
      FACEIT_WEBHOOK_SECRET?: string;

      // Twitch - Server-only
      TWITCH_CLIENT_ID: string;
      TWITCH_CLIENT_SECRET: string;
    }
  }
}

export {};
