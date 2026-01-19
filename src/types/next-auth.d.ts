import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Profile {
    guid?: string;
    nickname?: string;
    picture?: string;
  }

  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    faceitId?: string;
    nickname?: string;
    accessToken?: string;
  }
}
