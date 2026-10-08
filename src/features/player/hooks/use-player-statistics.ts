import { useQuery } from "@tanstack/react-query";
import { startOfToday, subDays } from "date-fns";
import { useMemo } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import { topics } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type PlayerStatisticsRange =
  | "currentSession"
  | "last20Matches"
  | "last7Days"
  | "last30Days"
  | "allTime";

const SESSION_GAP_HOURS = 4;
const SESSION_GAP_MS = SESSION_GAP_HOURS * 60 * 60 * 1000;
const MAX_SESSION_MATCHES = 20;

// Matches of this organizer don't count towards statistics.
const EXCLUDED_ORGANIZER_ID = "200aea79-4218-4289-a6ea-8261c610dd2e";

/**
 * Every finished match of the player, newest first. Fetched once per player
 * and sliced into ranges on the client, so switching ranges is free.
 *
 * Starts from `match_team_players` (indexed by player): starting from
 * `matches` made Postgres walk every match and timed out for active players.
 */
async function fetchPlayerMatches(playerId: string) {
  const { data } = await supabase
    .from("match_team_players")
    .select(`
      elo_before, elo_after, kills, deaths, assists, headshots, kr_ratio, adr,
      match_teams!inner(team_win, matches!inner(finished_at, organizer_id))
    `)
    .eq("player_id_mandatory", playerId)
    .eq("match_teams.matches.status", "FINISHED")
    .throwOnError();

  return data
    .map(({ match_teams: team, ...player }) => ({
      finishedAt: team.matches.finished_at,
      organizerId: team.matches.organizer_id,
      win: team.team_win,
      eloBefore: player.elo_before,
      eloAfter: player.elo_after,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      headshots: player.headshots,
      krRatio: player.kr_ratio,
      adr: player.adr,
    }))
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));
}

type PlayerMatchRow = Awaited<ReturnType<typeof fetchPlayerMatches>>[number];

/** Matches no more than SESSION_GAP_HOURS apart, counted back from the latest. */
function getCurrentSessionStart(matches: PlayerMatchRow[]) {
  const recent = matches
    .filter((m) => m.finishedAt)
    .slice(0, MAX_SESSION_MATCHES)
    .map((m) => new Date(m.finishedAt as string).getTime());

  let sessionStart = recent[0];
  for (let i = 1; i < recent.length; i++) {
    if (recent[i - 1] - recent[i] > SESSION_GAP_MS) break;
    sessionStart = recent[i];
  }

  return sessionStart;
}

function selectRange(matches: PlayerMatchRow[], range: PlayerStatisticsRange) {
  const counted = matches.filter(
    (m) => m.organizerId && m.organizerId !== EXCLUDED_ORGANIZER_ID,
  );
  const since = (time: number | undefined) =>
    time === undefined
      ? counted
      : counted.filter(
          (m) => m.finishedAt && new Date(m.finishedAt).getTime() >= time,
        );

  switch (range) {
    case "currentSession":
      return since(getCurrentSessionStart(matches));
    case "last20Matches":
      return counted.slice(0, 20);
    case "last7Days":
      return since(subDays(startOfToday(), 7).getTime());
    case "last30Days":
      return since(subDays(startOfToday(), 30).getTime());
    case "allTime":
      return counted;
  }
}

export function usePlayerStatistics(
  playerId: string,
  range: PlayerStatisticsRange,
) {
  useRealtime(["playerStatistics", playerId], [topics.player(playerId)]);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["playerStatistics", playerId],
    queryFn: () => fetchPlayerMatches(playerId),
    enabled: !!playerId,
  });

  const data = useMemo(
    () => matches && selectRange(matches, range),
    [matches, range],
  );

  return { data, isLoading };
}
