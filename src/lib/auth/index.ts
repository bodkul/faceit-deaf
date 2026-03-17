import { SupabaseAdapter } from "@auth/supabase-adapter";
import NextAuth from "next-auth";
import FaceItProvider from "next-auth/providers/faceit";
import TwitchProvider from "next-auth/providers/twitch";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    async signIn({ account }) {
      if (account?.provider === "twitch") {
        return true;
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
