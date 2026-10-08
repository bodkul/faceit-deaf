"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { format, getTime } from "date-fns";
import { groupBy, orderBy } from "es-toolkit";
import Link from "next/link";

import { TeamAvatar } from "@/components/team-avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EventMatchesSkeleton } from "@/features/events/components/event-matches-skeleton";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import type { EventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { queryKeys } from "@/lib/query-keys";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function fetchEventMatches(eventId: string) {
  const { data } = await supabase
    .from("event_matches")
    .select(
      `
        match_id,
        status,
        started_at,
        best_of,
        score_faction1,
        score_faction2,
        teams:event_match_teams (
          team_name,
          is_winner
        ),
        maps:event_match_maps (
          id
        )
      `,
    )
    .eq("event_id", eventId)
    .throwOnError();

  const teamNames = [
    ...new Set(
      data.flatMap((match) =>
        match.teams.map((t) => normalizeTeamName(t.team_name)),
      ),
    ),
  ];

  const { data: teamAvatars } = await supabase
    .from("teams")
    .select("name, avatar")
    .in("name", teamNames)
    .throwOnError();

  const avatarByName = new Map(teamAvatars.map((t) => [t.name, t.avatar]));

  const matches = data.map((match) => ({
    ...match,
    teams: match.teams.map((team) => {
      const name = normalizeTeamName(team.team_name);
      return { ...team, name, avatar: avatarByName.get(name) ?? null };
    }),
  }));

  return orderBy(matches, [(m) => getTime(m.started_at ?? 0)], ["desc"]);
}

type EventMatch = Awaited<ReturnType<typeof fetchEventMatches>>[number];
type MatchTeam = EventMatch["teams"][number];

function TeamCell({
  team,
  align,
}: {
  team: MatchTeam;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3",
        align === "left" ? "flex-row-reverse text-right" : "text-left",
      )}
    >
      <TeamAvatar name={team.name} src={team.avatar} className="size-8" />
      <span
        className={cn(
          "truncate font-semibold text-sm sm:text-base",
          team.is_winner === false && "text-muted-foreground",
        )}
      >
        {team.name}
      </span>
    </div>
  );
}

function MatchRow({ match, slug }: { match: EventMatch; slug: string }) {
  const [team1, team2] = match.teams;
  if (!team1 || !team2) return null;

  return (
    <Link
      href={`/events/${slug}/matches/${match.match_id}`}
      className="group grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-3 transition-colors hover:bg-foreground/[0.03] sm:gap-6 sm:px-4"
    >
      <TeamCell team={team1} align="left" />

      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-2 font-black font-mono text-xl tabular-nums">
          <span
            className={cn(team1.is_winner ? "text-win" : "text-foreground/70")}
          >
            {match.score_faction1 ?? "–"}
          </span>
          <span className="text-faint">:</span>
          <span
            className={cn(team2.is_winner ? "text-win" : "text-foreground/70")}
          >
            {match.score_faction2 ?? "–"}
          </span>
        </div>
        <span className="font-mono text-[10px] text-faint uppercase tracking-wider">
          Bo{match.best_of ?? match.maps.length}
          {match.started_at && ` · ${format(match.started_at, "HH:mm")}`}
        </span>
      </div>

      <TeamCell team={team2} align="right" />
    </Link>
  );
}

export function EventMatchesClient({ event }: { event: EventBySlug }) {
  const queryKey = queryKeys.events.matches(event.id);
  useRealtime(queryKey, eventSources);

  const { data: matches, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchEventMatches(event.id),
  });

  if (isLoading) return <EventMatchesSkeleton />;

  if (!matches?.length) {
    return (
      <Empty className="rounded-xl border border-border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTrophy />
          </EmptyMedia>
          <EmptyTitle>No matches yet</EmptyTitle>
          <EmptyDescription>
            Matches appear here as soon as the event starts.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const byDay = Object.entries(
    groupBy(matches, (m) =>
      m.started_at ? format(m.started_at, "yyyy-MM-dd") : "tbd",
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      {byDay.map(([day, dayMatches]) => (
        <section key={day} className="flex flex-col gap-3">
          <h2 className="font-mono text-[11px] text-faint uppercase tracking-wider">
            {day === "tbd" ? "Not scheduled" : format(day, "EEEE, d MMMM")}
            <span className="ml-2 text-faint/70">· {dayMatches.length}</span>
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            {dayMatches.map((match) => (
              <MatchRow key={match.match_id} match={match} slug={event.slug} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
