"use client";

import { signIn } from "next-auth/react";

import { FaceitIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SignInForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to FaceitDeaf</CardTitle>
        <CardDescription>
          Sign in with your FACEIT account to access all features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => signIn("faceit", { callbackUrl: "/" })}
          className="w-full bg-orange-500 text-foreground hover:bg-orange-600"
          size="lg"
        >
          <FaceitIcon className="size-5" />
          Sign in with FACEIT
        </Button>
      </CardContent>
    </Card>
  );
}
