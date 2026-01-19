declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: string;

      NEXT_PUBLIC_FACEIT_API_TOKEN: string;
      FACEIT_CLIENT_ID: string;
      FACEIT_CLIENT_SECRET: string;

      AUTH_SECRET: string;
      AUTH_URL?: string;
    }
  }
}

export {};
