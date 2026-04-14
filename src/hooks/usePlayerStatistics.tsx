import { useQuery } from "@tanstack/react-query";
import {
  differenceInMilliseconds,
  parseISO,
  startOfToday,
  subDays,
} from "date-fns";
import { nth } from "es-toolkit/compat";

import { supabaseClient } from "@/lib/supabase";

export type PlayerStatisticsRange =
  | "currentSession"
  | "last20Matches"
  | "last7Days"
  | "last30Days"
  | "allTime";

export const SESSION_GAP_HOURS = 4;
export const SESSION_GAP_MS = SESSION_GAP_HOURS * 60 * 60 * 1000;
export const MAX_SESSION_MATCHES = 20;

export function getDateFromRange(
  range: PlayerStatisticsRange,
): Date | undefined {
  switch (range) {
    case "last7Days":
      return subDays(startOfToday(), 7);
    case "last30Days":
      return subDays(startOfToday(), 30);
    default:
      return undefined;
  }
}

export async function getCurrentSessionStart(
  playerId: string,
): Promise<Date | undefined> {
  const { data } = await supabaseClient
    .from("matches")
    .select(`
      finished_at,
      match_teams!inner(
        match_team_players!inner(
          player_id_mandatory
        )
      )
    `)
    .eq("status", "FINISHED")
    .not("finished_at", "is", null)
    .eq("match_teams.match_team_players.player_id_mandatory", playerId)
    .order("finished_at", { ascending: false })
    .limit(MAX_SESSION_MATCHES)
    .throwOnError();

  if (!data?.length) {
    return undefined;
  }

  const firstFinishedAt = data.find(
    (match) => !!match.finished_at,
  )?.finished_at;

  if (!firstFinishedAt) {
    return undefined;
  }

  let sessionStart = parseISO(firstFinishedAt);
  let previousFinishedAt = firstFinishedAt;

  for (let i = 1; i < data.length; i++) {
    const currFinishedAt = nth(data, i)?.finished_at;

    if (!currFinishedAt) {
      continue;
    }

    const prev = parseISO(previousFinishedAt);
    const curr = parseISO(currFinishedAt);

    if (Number.isNaN(prev.getTime()) || Number.isNaN(curr.getTime())) {
      continue;
    }

    const diff = differenceInMilliseconds(prev, curr);

    if (diff > SESSION_GAP_MS) {
      break;
    }

    sessionStart = curr;
    previousFinishedAt = currFinishedAt;
  }

  return sessionStart;
}

export function usePlayerStatistics(
  playerId: string,
  range: PlayerStatisticsRange,
) {
  const { data, ...rest } = useQuery({
    queryKey: ["playerStatistics", playerId, range],
    queryFn: async () => {
      let query = supabaseClient
        .from("matches")
        .select(`
          match_teams!inner(
            team_win,
            match_team_players!inner(
              elo_before,
              elo_after,
              kills,
              deaths,
              assists,
              headshots,
              kr_ratio,
              adr
            )
          )
        `)
        .eq("status", "FINISHED")
        .eq("match_teams.match_team_players.player_id_mandatory", playerId)
        .neq("organizer_id", "200aea79-4218-4289-a6ea-8261c610dd2e")
        .order("finished_at", { ascending: false })
        .throwOnError();

      if (range === "currentSession") {
        const sessionStart = await getCurrentSessionStart(playerId);
        if (sessionStart) {
          query = query.gte("finished_at", sessionStart.toISOString());
        }
      } else if (range === "last20Matches") {
        query = query.limit(20);
      } else if (range !== "allTime") {
        const date = getDateFromRange(range);
        if (date) {
          query = query.gte("finished_at", date.toISOString());
        }
      }

      const { data } = await query;
      return data;
    },
    enabled: !!playerId,
  });

  const enhancedData = data?.flatMap((match) => {
    const team = match.match_teams[0];
    const player = team.match_team_players[0];

    return {
      win: team.team_win,
      eloBefore: player.elo_before,
      eloAfter: player.elo_after,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      headshots: player.headshots,
      krRatio: player.kr_ratio,
      adr: player.adr,
    };
  });

  return { data: enhancedData, ...rest };
}
