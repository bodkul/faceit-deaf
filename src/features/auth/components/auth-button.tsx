"use client";

import { signIn, useSession } from "next-auth/react";

import { FaceitIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { UserMenu } from "./user-menu";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-9 w-24 rounded-md" />;
  }

  if (status === "authenticated" && session.user) {
    return <UserMenu user={session.user} />;
  }

  return (
    <Button variant="faceit" onClick={() => signIn("faceit")}>
      <FaceitIcon />
      <span className="sm:hidden">Log in</span>
      <span className="hidden sm:inline">Log in with FACEIT</span>
    </Button>
  );
}
