import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";

import { fetchMatches } from "@/lib/faceit/api";
import { supabase } from "@/lib/supabase";
import { updateMatch } from "@/lib/supabase/mutations";

export async function GET() {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .in("status", ["READY", "ONGOING"]);

  if (!data || data.length === 0) {
    return NextResponse.json({ message: "No matches found" }, { status: 200 });
  }

  const matchIds = data.map((match) => `1-${match.id}`) || [];

  const matches = await fetchMatches(matchIds);

  matches
    .filter((match) => match.status === "ONGOING" || match.status === "READY")
    .forEach(async (match) => {
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
    });

  return NextResponse.json({ message: "OK" }, { status: 200 });
}
