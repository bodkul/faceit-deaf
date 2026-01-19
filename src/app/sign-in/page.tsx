import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { SignInForm } from "./_components/sign-in-form";

export const metadata = {
  title: "Sign In",
  description: "Sign in with your FACEIT account",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SignInForm />
    </div>
  );
}
