import NextAuth from "next-auth";
import FaceIt from "next-auth/providers/faceit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    FaceIt({
      clientId: process.env.NEXT_PUBLIC_FACEIT_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_FACEIT_CLIENT_SECRET,
    }),
  ],
});
