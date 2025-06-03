"use client";

import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth";

export default function SignInButton() {
  return (
    <Button
      className="cursor-pointer"
      variant="outline"
      onClick={() => login()}
    >
      Login with Faceit
    </Button>
  );
}
