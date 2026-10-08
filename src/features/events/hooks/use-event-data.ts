import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { mergeSeries } from "@/features/events/lib/series";
import { useRealtime } from "@/hooks/use-realtime";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Every match of the event without stats: enough to group games into series
 * and work out results. Views then fetch stats only for what they show.
 */
async function fetchEventSeries(slug: string) {
  const { data } = await supabase
    .from("event_matches")
    .select(`
      match_id, status, started_at, finished_at, best_of,
      score_faction1, score_faction2, winner_faction,
      teams:event_match_teams (id, faction_id, faction_key, team_name, is_winner),
      maps:event_match_maps (id, map_name, match_round, total_rounds, winner_faction_id),
      events!inner()
    `)
    .eq("events.slug", slug)
    .throwOnError();

  return mergeSeries(data);
}

/**
 * The series list through the query cache, so moving between matches and
 * teams of one event fetches it once. Realtime invalidates the whole
 * `["event", slug]` prefix, which marks it stale too.
 */
function getEventSeries(queryClient: QueryClient, slug: string) {
  return queryClient.fetchQuery({
    queryKey: ["event", slug, "series"],
    queryFn: () => fetchEventSeries(slug),
  });
}

/** One series with full per-map team and player stats. */
async function fetchEventMatch(
  queryClient: QueryClient,
  slug: string,
  matchId: string,
) {
  const series = (await getEventSeries(queryClient, slug)).find((s) =>
    s.match_ids.includes(matchId),
  );
  if (!series) return null;

  const { data } = await supabase
    .from("event_matches")
    .select(`
      match_id, status, started_at, finished_at, best_of,
      score_faction1, score_faction2, winner_faction,
      teams:event_match_teams (id, faction_id, faction_key, team_name, is_winner),
      maps:event_match_maps (
        id, map_name, match_round, total_rounds, winner_faction_id,
        team_stats:event_map_team_stats (
          id, faction_id, team_name, final_score, first_half_score,
          second_half_score, overtime_score, is_winner, team_headshots
        ),
        player_stats:event_map_player_stats (
          id, player_id, nickname, faction_id, result, kills, deaths, assists,
          headshots, headshots_pct, adr, kd_ratio, mvps, entry_count,
          entry_wins, first_kills, triple_kills, clutch_kills
        )
      )
    `)
    .in("match_id", series.match_ids)
    .throwOnError();

  return mergeSeries(data)[0] ?? null;
}

/** The team's series, with stats for the team's own players only. */
async function fetchEventTeamMatches(
  queryClient: QueryClient,
  slug: string,
  teamName: string,
) {
  const isOurs = (name: string) => normalizeTeamName(name) === teamName;
  const series = (await getEventSeries(queryClient, slug)).filter((s) =>
    s.teams.some((t) => isOurs(t.team_name)),
  );

  const mapIds = series.flatMap((s) => s.maps.map((m) => m.id));
  const factionIds = series.flatMap((s) =>
    s.teams.filter((t) => isOurs(t.team_name)).map((t) => t.faction_id),
  );

  const { data: stats } = mapIds.length
    ? await supabase
        .from("event_map_player_stats")
        .select(
          "match_map_id, player_id, nickname, faction_id, kills, deaths, adr, mvps",
        )
        .in("match_map_id", mapIds)
        .in("faction_id", [...new Set(factionIds)])
        .throwOnError()
    : { data: [] };

  const statsByMap = Map.groupBy(stats, (s) => s.match_map_id);

  return series.map((s) => ({
    ...s,
    maps: s.maps.map((map) => ({
      ...map,
      player_stats: statsByMap.get(map.id) ?? [],
    })),
  }));
}

/** The player's maps in the event, with the match they belong to. */
async function fetchEventPlayerMaps(slug: string, playerId: string) {
  const { data } = await supabase
    .from("event_map_player_stats")
    .select(`
      nickname, faction_id, kills, deaths, assists, headshots, adr, mvps,
      map:event_match_maps!inner (
        map_name, match_round, winner_faction_id,
        match:event_matches!inner (
          match_id, started_at,
          teams:event_match_teams (faction_id, team_name),
          events!inner()
        )
      )
    `)
    .eq("player_id", playerId)
    .eq("map.match.events.slug", slug)
    .throwOnError();

  return data;
}

export function useEventMatch(slug: string, matchId: string) {
  const queryClient = useQueryClient();
  useRealtime(["event", slug], eventSources);

  return useQuery({
    queryKey: ["event", slug, "match", matchId],
    queryFn: () => fetchEventMatch(queryClient, slug, matchId),
  });
}

export function useEventTeamMatches(slug: string, teamName: string) {
  const queryClient = useQueryClient();
  useRealtime(["event", slug], eventSources);

  return useQuery({
    queryKey: ["event", slug, "team", teamName],
    queryFn: () => fetchEventTeamMatches(queryClient, slug, teamName),
  });
}

export function useEventPlayerMaps(slug: string, playerId: string) {
  const queryKey = ["event", slug, "player", playerId];
  useRealtime(queryKey, eventSources);

  return useQuery({
    queryKey,
    queryFn: () => fetchEventPlayerMaps(slug, playerId),
  });
}

export type EventMatch = NonNullable<
  Awaited<ReturnType<typeof fetchEventMatch>>
>;
