import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";
import pMap from "p-map";

import { fetchMatches } from "@/lib/faceit/api";
import { supabase } from "@/lib/supabase";
import {
  getActiveMatches,
  updateMatch,
  updateMatchTeam,
} from "@/lib/supabase/mutations";

export async function GET() {
  const data = await getActiveMatches();
  const matchIds = data?.map((match) => `1-${match.id}`) || [];

  if (!matchIds.length) {
    return NextResponse.json({ message: "No matches found" });
  }

  const matches = await fetchMatches(matchIds);

  const relevantMatches = matches.filter((m) =>
    ["ONGOING", "READY"].includes(m.status),
  );

  await pMap(
    relevantMatches,
    async ({ match_id, voting, started_at, status, results, teams }) => {
      const id = match_id.replace(/^1-/, "");

      await updateMatch(id, {
        location_pick: voting.location?.pick[0],
        map_pick: voting.map?.pick[0],
        started_at: started_at
          ? fromUnixTime(started_at).toISOString()
          : undefined,
        status,
        round_score: results
          ? `${results.score.faction1} / ${results.score.faction2}`
          : undefined,
      });

      if (results) {
        await Promise.all([
          updateMatchTeam(id, teams.faction1.faction_id, {
            final_score: results.score.faction1,
          }),
          updateMatchTeam(id, teams.faction2.faction_id, {
            final_score: results.score.faction2,
          }),
        ]);
      }
    },
    { concurrency: 3 },
  );

  await supabase.channel(`live-matches`).send({
    type: "broadcast",
    event: "*",
  });

  return NextResponse.json({ message: "OK" });
}
