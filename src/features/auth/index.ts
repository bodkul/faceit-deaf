import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import FaceItProvider from "next-auth/providers/faceit";
import TwitchProvider from "next-auth/providers/twitch";

import { createAdminClient } from "@/lib/supabase/admin";

const supabase = createAdminClient();

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
  events: {
    // Runs after the adapter has created/loaded the user, so `user.id` is the
    // database id. In `callbacks.signIn` it is still the provider profile id
    // (FACEIT guid) on a user's first login.
    async signIn({ user, account, profile }) {
      const playerId = profile?.guid;
      if (account?.provider !== "faceit" || !playerId || !user.id) return;

      await supabase
        .from("players")
        .update({ auth_user_id: user.id })
        .eq("id", playerId);
    },
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
