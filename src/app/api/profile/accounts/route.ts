import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: { schema: "next_auth" },
  },
);

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ twitch: false });

  const { data } = await supabase
    .from("accounts")
    .select("provider, providerAccountId")
    .eq("userId", session.user.id);

  const twitch = data?.some((a) => a.provider === "twitch") ?? false;

  return NextResponse.json({ twitch });
}
