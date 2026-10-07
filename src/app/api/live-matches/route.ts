import { fromUnixTime } from "date-fns";
import { mapAsync } from "es-toolkit";
import { NextResponse } from "next/server";

import { faceit } from "@/lib/faceit/client";
import { getMatchId } from "@/lib/faceit/utils";
import { supabaseClient } from "@/lib/supabase";
import {
  getActiveMatches,
  updateMatch,
  updateMatchTeam,
} from "@/lib/supabase/mutations";

export async function GET() {
  const activeMatches = await getActiveMatches();

  if (!activeMatches.length) {
    return NextResponse.json({ message: "No matches found" });
  }

  const matches = await faceit.matches.getMatchesDetails(
    activeMatches.map((match) => `1-${match.id}`),
  );

  const relevantMatches = matches.filter((m) =>
    ["ONGOING", "READY"].includes(m.status),
  );

  await mapAsync(
    relevantMatches,
    async ({ match_id, voting, started_at, status, results, teams }) => {
      const id = getMatchId({ id: match_id });

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

  await supabaseClient.channel("live-matches").httpSend("*", {});

  return NextResponse.json({ message: "OK" });
}
