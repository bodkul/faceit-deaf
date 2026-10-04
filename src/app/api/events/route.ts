import { NextResponse } from "next/server";

import { supabaseClient } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabaseClient.from("events").select(`
    *,
    event_matches (
      *,
      event_match_teams (*),
      event_match_maps (
        *,
        event_map_team_stats (*),
        event_map_player_stats (*)
      )
    )
  `);

  return NextResponse.json(data);
}
