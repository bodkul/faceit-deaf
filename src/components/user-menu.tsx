"use server";

import { LoginButton } from "@/components/login-button";
import { UserNav } from "@/components/user-nav";
import { auth } from "@/lib/auth";

export async function UserMenu() {
  const session = await auth();

  return session?.user ? <UserNav user={session.user} /> : <LoginButton />;
}
