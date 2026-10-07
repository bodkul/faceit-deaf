import { cache } from "react";

import { normalizeTeamName } from "@/lib/normalize-team-name";
import { supabaseClient } from "@/lib/supabase";

export type EventBySlug = NonNullable<
  Awaited<ReturnType<typeof getEventBySlug>>
>;

export const getEventBySlug = cache(async (slug: string) => {
  const { data } = await supabaseClient
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
});
