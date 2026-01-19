import type { NextAuthOptions } from "next-auth";
import FaceItProvider from "next-auth/providers/faceit";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    FaceItProvider({
      clientId: process.env.FACEIT_CLIENT_ID!,
      clientSecret: process.env.FACEIT_CLIENT_SECRET!,
      checks: ["pkce", "state"],
      idToken: true,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.faceitId = (profile.guid ?? profile.sub) as string;
        token.nickname = profile.nickname as string;
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.faceitId as string;
        session.user.name = token.nickname as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
