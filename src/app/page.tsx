"use server";

import { auth } from "@/lib/auth";

import { EloRankings } from "./_components/EloRankings";
import { LiveMatches } from "./_components/LiveMatches";

export default async function Page() {
  const session = await auth();

  console.log("Session:", session);

  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to faceitdeaf
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveMatches />
        <EloRankings />
      </div>
    </>
  );
}
