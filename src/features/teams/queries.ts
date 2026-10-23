import { orderBy } from "es-toolkit";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  hasTeamName,
  normalizeTeamName,
} from "@/features/events/lib/normalize-team-name";
import { mergeSeries } from "@/features/events/lib/series";
import { createClient } from "@/lib/supabase/server";

type TeamEvent = {
  slug: string;
  name: string;
  logo_url: string;
  start_date: string;
  end_date: string;
  wins: number;
  losses: number;
};

type TeamResult = {
  match_id: string;
  event_slug: string;
  event_name: string;
  started_at: string | null;
  opponent: string;
  maps_won: number;
  maps_lost: number;
  win: boolean | null;
};

type TeamPlayer = {
  player_id: string;
  nickname: string;
  avatar: string | null;
  /** Set when the player is tracked, so they have a profile page. */
  profile: string | null;
  maps: number;
  kills: number;
  deaths: number;
  adr_total: number;
  mvps: number;
  events: number;
};

export type Team = {
  name: string;
  wins: number;
  losses: number;
  maps_won: number;
  maps_lost: number;
  last_played: string | null;
  events: TeamEvent[];
  results: TeamResult[];
  roster: TeamPlayer[];
};

/**
 * Teams aren't stored on their own: they're assembled from event matches,
 * keyed by normalized team name, so a team that renamed itself stays one team.
 */
export const getTeams = cache(async (): Promise<Team[]> => {
  const supabase = createClient();

  const { data: events } = await supabase
    .from("events")
    .select(`
      slug, name, logo_url, start_date, end_date,
      matches:event_matches (
        match_id, started_at, finished_at, best_of,
        teams:event_match_teams (faction_id, team_name, is_winner),
        maps:event_match_maps (
          winner_faction_id,
          player_stats:event_map_player_stats (
            faction_id, player_id, nickname, kills, deaths, adr, mvps
          )
        )
      )
    `)
    .throwOnError();

  type TeamTotals = Omit<Team, "roster" | "events"> & {
    events: Map<string, TeamEvent>;
    roster: Map<string, TeamPlayer & { eventSlugs: Set<string> }>;
  };
  const teams = new Map<string, TeamTotals>();

  for (const { matches, ...event } of events) {
    for (const match of mergeSeries(matches)) {
      for (const side of match.teams) {
        const name = normalizeTeamName(side.team_name);
        const opponent = match.teams.find(
          (t) => t.faction_id !== side.faction_id,
        );

        const team: TeamTotals = teams.get(name) ?? {
          name,
          wins: 0,
          losses: 0,
          maps_won: 0,
          maps_lost: 0,
          last_played: null,
          events: new Map(),
          results: [],
          roster: new Map(),
        };
        teams.set(name, team);

        const mapsWon = match.maps.filter(
          (m) => m.winner_faction_id === side.faction_id,
        ).length;
        const mapsLost = match.maps.filter(
          (m) =>
            m.winner_faction_id != null &&
            m.winner_faction_id !== side.faction_id,
        ).length;

        const teamEvent = team.events.get(event.slug) ?? {
          ...event,
          wins: 0,
          losses: 0,
        };
        team.events.set(event.slug, teamEvent);

        if (side.is_winner === true) {
          team.wins++;
          teamEvent.wins++;
        } else if (side.is_winner === false) {
          team.losses++;
          teamEvent.losses++;
        }
        team.maps_won += mapsWon;
        team.maps_lost += mapsLost;

        if (
          match.started_at &&
          (!team.last_played || match.started_at > team.last_played)
        ) {
          team.last_played = match.started_at;
        }

        team.results.push({
          match_id: match.match_id,
          event_slug: event.slug,
          event_name: event.name,
          started_at: match.started_at,
          opponent: opponent ? normalizeTeamName(opponent.team_name) : "TBD",
          maps_won: mapsWon,
          maps_lost: mapsLost,
          win: side.is_winner,
        });

        for (const map of match.maps) {
          for (const stats of map.player_stats) {
            if (stats.faction_id !== side.faction_id) continue;

            const player = team.roster.get(stats.player_id) ?? {
              player_id: stats.player_id,
              nickname: stats.nickname,
              avatar: null,
              profile: null,
              maps: 0,
              kills: 0,
              deaths: 0,
              adr_total: 0,
              mvps: 0,
              events: 0,
              eventSlugs: new Set<string>(),
            };
            team.roster.set(stats.player_id, player);

            player.maps++;
            player.kills += stats.kills ?? 0;
            player.deaths += stats.deaths ?? 0;
            player.adr_total += stats.adr ?? 0;
            player.mvps += stats.mvps ?? 0;
            player.eventSlugs.add(event.slug);
          }
        }
      }
    }
  }

  // Tracked players get their FACEIT avatar and a link to their profile.
  // There are only a few hundred, so fetch them all rather than a long `in`.
  const { data: tracked } = await supabase
    .from("players")
    .select("id, nickname, avatar")
    .throwOnError();
  const trackedById = new Map(tracked.map((p) => [p.id, p]));

  return orderBy(
    [...teams.values()].map((team) => ({
      ...team,
      events: orderBy([...team.events.values()], ["start_date"], ["desc"]),
      results: orderBy(team.results, [(r) => r.started_at ?? ""], ["desc"]),
      roster: orderBy(
        [...team.roster.values()].map(({ eventSlugs, ...player }) => {
          const profile = trackedById.get(player.player_id);
          return {
            ...player,
            avatar: profile?.avatar ?? null,
            profile: profile?.nickname ?? null,
            events: eventSlugs.size,
          };
        }),
        ["maps", (p) => p.kills / Math.max(p.deaths, 1)],
        ["desc", "desc"],
      ),
    })),
    [(t) => t.wins + t.losses, (t) => t.wins / Math.max(t.wins + t.losses, 1)],
    ["desc", "desc"],
  );
});

export async function getTeam(name: string) {
  const teams = await getTeams();
  return teams.find((team) => team.name === name) ?? null;
}

/** Cheap existence check (team names only), so layouts can 404 before streaming. */
export const ensureTeamExists = cache(async (name: string) => {
  const { data } = await createClient()
    .from("event_match_teams")
    .select("team_name")
    .throwOnError();

  if (!data.some(hasTeamName(name))) {
    notFound();
  }
});
