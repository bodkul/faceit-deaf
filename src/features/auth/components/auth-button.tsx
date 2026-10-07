"use client";

import { signIn, useSession } from "next-auth/react";

import { FaceitIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

import { UserMenu } from "./user-menu";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (status === "authenticated" && session.user) {
    return <UserMenu user={session.user} />;
  }

  return (
    <Button variant="faceit" onClick={() => signIn("faceit")}>
      <FaceitIcon />
      Login with Faceit
    </Button>
  );
}
