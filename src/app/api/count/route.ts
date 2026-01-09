import { NextResponse } from "next/server";
import pMap from "p-map";

import { fetchFaceitCs2TimeStatsWithLogging } from "@/lib/faceit/api/v1";
import { supabaseClient } from "@/lib/supabase";
import { handleSupabaseError } from "@/lib/supabase/utils";

const PLAYER_ID = "ce7684cf-e582-4ebd-9293-608fcd5696ee" as const;

export async function GET() {
  const items = await fetchFaceitCs2TimeStatsWithLogging(PLAYER_ID);

  const { data } = await supabaseClient
    .from("match_team_players")
    .select("id, player_id_nullable, match_teams(matches(id))")
    .eq("player_id_nullable", PLAYER_ID);

  pMap(
    items.data,
    async (item) => {
      const { error } = await supabaseClient
        .from("match_team_players")
        .update({ elo: item.elo, elo_delta: item.elo_delta })
        .match({
          id: data?.find(
            (d) => d.match_teams.matches.id === item.matchId.replace(/^1-/, ""),
          )?.id,
        });

      if (error) {
        handleSupabaseError("update match team player", error);
      }
    },
    { concurrency: 5 },
  );

  return NextResponse.json({ items });
}
