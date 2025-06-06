"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      onClick={() => signIn("faceit")}
    >
      Login with Faceit
    </Button>
  );
}
