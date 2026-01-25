import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import FaceIt from "next-auth/providers/faceit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    FaceIt({
      clientId: process.env.FACEIT_CLIENT_ID,
      clientSecret: process.env.FACEIT_CLIENT_SECRET,
      issuer: "https://api.faceit.com/auth",
      profile(profile) {
        return {
          id: profile.guid,
          name: profile.nickname,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
});
