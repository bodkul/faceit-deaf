import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import FaceItProvider from "next-auth/providers/faceit";
import TwitchProvider from "next-auth/providers/twitch";

import { supabaseClient } from "@/lib/supabase";

export const { handlers, auth } = NextAuth({
  providers: [
    FaceItProvider({
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
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "faceit") {
        const userId = profile?.guid;
        if (userId) {
          await supabaseClient
            .from("players")
            .update({ auth_user_id: user.id })
            .eq("id", userId);
        }
      }

      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
