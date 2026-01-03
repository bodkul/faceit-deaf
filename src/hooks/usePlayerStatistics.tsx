import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { startOfToday, subDays } from "date-fns";

import { supabaseClient } from "@/lib/supabase";

export type PlayerStatisticsRange =
  | "20matches"
  | "100matches"
  | "alltime"
  | "today"
  | "last7days"
  | "last30days";

function getDateFromRange(range: PlayerStatisticsRange): Date | undefined {
  switch (range) {
    case "today":
      return startOfToday();
    case "last7days":
      return subDays(startOfToday(), 7);
    case "last30days":
      return subDays(startOfToday(), 30);
  }
}

export function usePlayerStatistics(
  playerId: string,
  range: PlayerStatisticsRange,
) {
  let query = supabaseClient
    .from("matches")
    .select(
      "match_teams!inner(team_win, match_team_players!inner(elo_before, elo_after, player_stats_normalized!inner(kills, deaths, assists, headshots, kr_ratio, adr)))",
    )
    .eq("status", "FINISHED")
    .eq("match_teams.match_team_players.player_id_mandatory", playerId)
    .order("finished_at", { ascending: false });

  if (range === "20matches" || range === "100matches") {
    const limit = range === "20matches" ? 20 : 100;
    query = query.limit(limit);
  } else if (range !== "alltime") {
    const date = getDateFromRange(range);
    if (date) {
      query = query.gte("finished_at", date.toISOString());
    }
  }

  const { data, ...rest } = useQuery(query);

  const enhancedData = data?.map((match) => {
    const team = match.match_teams[0];
    const player = team.match_team_players[0];

    return {
      win: team.team_win,
      eloBefore: player.elo_before,
      eloAfter: player.elo_after,
      kills: player.player_stats_normalized.kills,
      deaths: player.player_stats_normalized.deaths,
      assists: player.player_stats_normalized.assists,
      headshots: player.player_stats_normalized.headshots,
      krRatio: player.player_stats_normalized.kr_ratio,
      adr: player.player_stats_normalized.adr,
    };
  });

  return { data: enhancedData, ...rest };
}
