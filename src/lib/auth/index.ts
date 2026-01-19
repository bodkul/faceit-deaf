import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

interface FaceitProfile {
  guid: string;
  sub?: string;
  nickname?: string;
  name?: string;
  email?: string;
  picture?: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "faceit",
      name: "FACEIT",
      type: "oauth",
      clientId: process.env.FACEIT_CLIENT_ID!,
      clientSecret: process.env.FACEIT_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.faceit.com",
        params: { scope: "openid profile email" },
      },
      token: "https://api.faceit.com/auth/v1/oauth/token",
      userinfo: "https://api.faceit.com/auth/v1/resources/userinfo",
      issuer: "https://api.faceit.com/auth",
      checks: ["pkce", "state"],
      idToken: true,
      profile(profile: FaceitProfile) {
        return {
          id: profile.guid ?? profile.sub ?? "",
          name: profile.nickname ?? profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    } as OAuthConfig<FaceitProfile>,
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // После входа редирект на главную
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
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
