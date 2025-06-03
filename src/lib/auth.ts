import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import FaceIt from "next-auth/providers/faceit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    FaceIt({
      clientId: process.env.NEXT_PUBLIC_FACEIT_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_FACEIT_CLIENT_SECRET,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  }),
});
