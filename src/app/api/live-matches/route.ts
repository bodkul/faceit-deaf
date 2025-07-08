import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";
import pMap from "p-map";

import { fetchMatches } from "@/lib/faceit/api";
import { supabase } from "@/lib/supabase";
import { updateMatch } from "@/lib/supabase/mutations";

export async function GET() {
  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"]);

  if (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }

  const matchIds = data?.map((match) => `1-${match.id}`) || [];

  if (matchIds.length === 0) {
    return NextResponse.json({ message: "No matches found" }, { status: 200 });
  }

  const matches = await fetchMatches(matchIds);

  await pMap(
    matches.filter(
      (match) => match.status === "ONGOING" || match.status === "READY",
    ),
    async (match) => {
      const matchId = match.match_id.replace(/^1-/, "");

      await updateMatch(matchId, {
        location_pick: match.voting.location?.pick[0],
        map_pick: match.voting.map?.pick[0],
        started_at: match.started_at
          ? fromUnixTime(match.started_at).toISOString()
          : undefined,
        status: match.status,
        round_score: match.results
          ? `${match.results.score.faction1} / ${match.results.score.faction2}`
          : undefined,
      });
    },
    { concurrency: 3 },
  );

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
