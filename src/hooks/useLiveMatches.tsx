"use client";

import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";
import { subMinutes } from "date-fns";

import { supabase } from "@/lib/supabase";

const fifteenMinutesAgo = subMinutes(new Date(), 15).toISOString();

export function useLiveMatches() {
  const { mutate, ...query } = useQuery(
    supabase
      .from("matches")
      .select(
        "id, started_at, finished_at, round_score, map_pick, teams:match_teams(players:match_team_players(nickname))",
      )
      .or(
        `status.in.(READY,ONGOING),and(status.eq.FINISHED,finished_at.gt.${fifteenMinutesAgo})`,
      )
      .not("teams.players.player_id_nullable", "is", null)
      .order("started_at", { ascending: false }),
  );

  useSubscription(
    supabase,
    "live_matches_subscription",
    {
      event: "*",
      table: "matches",
      schema: "public",
    },
    ["id"],
    {
      callback: () => mutate().then(),
    },
  );

  return query;
}
