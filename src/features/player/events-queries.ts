import { orderBy } from "es-toolkit";

import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { createClient } from "@/lib/supabase/server";

export type PlayerEvent = Awaited<ReturnType<typeof getPlayerEvents>>[number];

/** Every event the player has a map in, with their team and per-event totals. */
export async function getPlayerEvents(playerId: string) {
  const { data: stats } = await createClient()
    .from("event_map_player_stats")
    .select(`
      faction_id, kills, deaths, adr, mvps, headshots,
      map:event_match_maps!inner (
        match:event_matches!inner (
          match_id,
          event:events!inner (slug, name, logo_url, start_date, end_date),
          teams:event_match_teams (faction_id, team_name, is_winner)
        )
      )
    `)
    .eq("player_id", playerId)
    .throwOnError();

  const events = new Map<
    string,
    {
      slug: string;
      name: string;
      logo_url: string;
      start_date: string;
      end_date: string;
      teams: Set<string>;
      series: Map<string, boolean | null>;
      maps: number;
      kills: number;
      deaths: number;
      adr_total: number;
      headshots: number;
      mvps: number;
    }
  >();

  for (const row of stats) {
    const { event, match_id, teams } = row.map.match;
    const side = teams.find((t) => t.faction_id === row.faction_id);

    const totals = events.get(event.slug) ?? {
      ...event,
      teams: new Set<string>(),
      series: new Map<string, boolean | null>(),
      maps: 0,
      kills: 0,
      deaths: 0,
      adr_total: 0,
      headshots: 0,
      mvps: 0,
    };
    events.set(event.slug, totals);

    if (side) totals.teams.add(normalizeTeamName(side.team_name));
    totals.series.set(match_id, side?.is_winner ?? null);
    totals.maps++;
    totals.kills += row.kills ?? 0;
    totals.deaths += row.deaths ?? 0;
    totals.adr_total += row.adr ?? 0;
    totals.headshots += row.headshots ?? 0;
    totals.mvps += row.mvps ?? 0;
  }

  return orderBy(
    [...events.values()].map(({ teams, series, ...event }) => {
      const results = [...series.values()];
      return {
        ...event,
        teams: [...teams],
        wins: results.filter((r) => r === true).length,
        losses: results.filter((r) => r === false).length,
      };
    }),
    ["start_date"],
    ["desc"],
  );
}
