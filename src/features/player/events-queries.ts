import { orderBy } from "es-toolkit";

import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { mergeSeries } from "@/features/events/lib/series";
import { createClient } from "@/lib/supabase/server";

export type PlayerEvent = Awaited<ReturnType<typeof getPlayerEvents>>[number];

/** Every event the player has a map in, with their team and per-event totals. */
export async function getPlayerEvents(playerId: string) {
  const supabase = createClient();

  const { data: stats } = await supabase
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

  // Series results need every game of the series, not just the player's maps.
  const seriesByMatchId = await getSeriesByMatchId([
    ...new Set(stats.map((row) => row.map.match.event.slug)),
  ]);

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

    const series = seriesByMatchId.get(match_id);
    const seriesSide = series?.teams.find(
      (t) => t.faction_id === row.faction_id,
    );

    if (side) totals.teams.add(normalizeTeamName(side.team_name));
    totals.series.set(
      series?.match_id ?? match_id,
      seriesSide?.is_winner ?? side?.is_winner ?? null,
    );
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

async function getSeriesByMatchId(slugs: string[]) {
  const { data: matches } = await createClient()
    .from("event_matches")
    .select(`
      match_id, started_at, best_of,
      event:events!inner (slug),
      teams:event_match_teams (faction_id, team_name, is_winner),
      maps:event_match_maps (winner_faction_id)
    `)
    .in("event.slug", slugs)
    .throwOnError();

  const bySlug = Map.groupBy(matches, (m) => m.event.slug);
  const seriesByMatchId = new Map<
    string,
    ReturnType<typeof mergeSeries<(typeof matches)[number]>>[number]
  >();

  for (const eventMatches of bySlug.values()) {
    for (const series of mergeSeries(eventMatches)) {
      for (const id of series.match_ids) seriesByMatchId.set(id, series);
    }
  }

  return seriesByMatchId;
}
