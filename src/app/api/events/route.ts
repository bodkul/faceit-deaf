import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

export async function GET() {
  const { data, error } = await supabase.from("events").select(`
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

  if (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 },
    );
  }

  return NextResponse.json(data);
}
