export const twitchConfig = {
  CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
  CLIENT_SECRET: process.env.NEXT_PUBLIC_TWITCH_CLIENT_SECRET!,
  CS2_GAME_ID: 32399,
  PARENT_DOMAIN: process.env.NEXT_PUBLIC_PARENT_DOMAIN,
};

export const supabaseConfig = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

export const faceitApiConfig = {
  URL: process.env.NEXT_PUBLIC_API_URL!,
  TOKEN: process.env.NEXT_PUBLIC_API_TOKEN!,
};
