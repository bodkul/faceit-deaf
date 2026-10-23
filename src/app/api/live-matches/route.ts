import { mapAsync } from "es-toolkit";
import { after, type NextRequest, NextResponse } from "next/server";

import { isAuthorized } from "@/lib/api-auth";
import { getMatches } from "@/lib/faceit/api";
import { getMatchId, unixToISO } from "@/lib/faceit/utils";
import { broadcast } from "@/lib/realtime/broadcast";
import { topics } from "@/lib/realtime/topics";
import {
  deleteMatch,
  getActiveMatches,
  updateMatch,
  updateMatchTeam,
} from "@/lib/supabase/mutations";
import {
  syncFinishedMatchOptions,
  syncFinishedMatchTask,
} from "@/trigger/sync-finished-match";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request, "x-cron-secret", process.env.CRON_SECRET)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const activeMatches = await getActiveMatches();

  if (!activeMatches.length) {
    return NextResponse.json({ message: "No matches found" });
  }

  const matches = await getMatches(
    activeMatches.map((match) => `1-${match.id}`),
  );

  const relevantMatches = matches.filter((m) =>
    ["ONGOING", "READY"].includes(m.status),
  );
  // Normally closed by the FACEIT webhook; this catches the ones it missed.
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");
  const cancelledMatches = matches.filter((m) =>
    ["CANCELLED", "ABORTED"].includes(m.status),
  );

  if (finishedMatches.length) {
    await syncFinishedMatchTask.batchTrigger(
      finishedMatches.map((m) => ({
        payload: { id: m.match_id },
        options: syncFinishedMatchOptions(m.match_id),
      })),
    );
  }

  await Promise.all(
    cancelledMatches.map((m) => deleteMatch(getMatchId({ id: m.match_id }))),
  );

  await mapAsync(
    relevantMatches,
    async ({ match_id, voting, started_at, status, results, teams }) => {
      const id = getMatchId({ id: match_id });

      await Promise.all([
        updateMatch(id, {
          location_pick: voting?.location?.pick[0],
          map_pick: voting?.map?.pick[0],
          started_at: unixToISO(started_at),
          status,
          round_score: results
            ? `${results.score.faction1} / ${results.score.faction2}`
            : undefined,
        }),
        results &&
          updateMatchTeam(id, teams.faction1.faction_id, {
            final_score: results.score.faction1,
          }),
        results &&
          updateMatchTeam(id, teams.faction2.faction_id, {
            final_score: results.score.faction2,
          }),
      ]);
    },
    { concurrency: 3 },
  );

  after(() =>
    broadcast([
      topics.liveMatches,
      ...[...relevantMatches, ...cancelledMatches].map((m) =>
        topics.match(getMatchId({ id: m.match_id })),
      ),
    ]),
  );

  return NextResponse.json({ message: "OK" });
}
