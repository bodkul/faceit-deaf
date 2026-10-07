import { NextResponse } from "next/server";

import { auth } from "@/features/auth";
import { supabaseAuth } from "@/lib/supabase/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ twitch: false });

  const { data } = await supabaseAuth
    .from("accounts")
    .select("provider, providerAccountId")
    .eq("userId", session.user.id);

  const twitch = data?.some((a) => a.provider === "twitch") ?? false;

  return NextResponse.json({ twitch });
}
