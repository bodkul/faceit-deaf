import { notFound } from "next/navigation";
import { cache } from "react";

import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { createClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

export type EventBySlug = NonNullable<
  Awaited<ReturnType<typeof getEventBySlug>>
>;

/** Shared by server code and the client-side event card, so the caller picks the client. */
export async function getEventBySlug(
  supabase: TypedSupabaseClient,
  slug: string,
) {
  const { data } = await supabase
    .from("events")
    .select("*, matches:event_matches(teams:event_match_teams(team_name))")
    .match({ slug })
    .maybeSingle()
    .throwOnError();

  if (!data) return null;

  const { matches, ...event } = data;

  const items = [
    ...new Set(
      matches?.flatMap((m) =>
        m.teams?.map((t) => normalizeTeamName(t.team_name)),
      ) ?? [],
    ),
  ].map((name) => ({ name }));

  return {
    ...event,
    teams: { count: items.length, items },
  };
}

export type EventListItem = Awaited<ReturnType<typeof getEvents>>[number];

/** Events newest first, with the number of distinct teams that played. */
export async function getEvents(limit?: number) {
  let query = createClient()
    .from("events")
    .select(
      "id, name, logo_url, start_date, end_date, slug, event_matches(event_match_teams(team_name))",
    )
    .order("start_date", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data } = await query.throwOnError();

  return data.map(({ event_matches, ...event }) => ({
    ...event,
    teamsCount: new Set(
      event_matches.flatMap((match) =>
        match.event_match_teams.map((team) =>
          normalizeTeamName(team.team_name),
        ),
      ),
    ).size,
  }));
}

export const ensureEventExists = cache(async (slug: string) => {
  const event = await getEventBySlug(createClient(), slug);
  if (!event) notFound();
  return event;
});
