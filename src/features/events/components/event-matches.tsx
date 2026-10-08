"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { getTime } from "date-fns";
import { orderBy } from "es-toolkit";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { EventMatchesSkeleton } from "@/features/events/components/event-matches-skeleton";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import type { EventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { queryKeys } from "@/lib/query-keys";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function EventMatchesClient({ event }: { event: EventBySlug }) {
  useRealtime(queryKeys.events.matches(event.id), eventSources);

  const { data: matches, isLoading } = useQuery({
    queryKey: queryKeys.events.matches(event.id),
    queryFn: async () => {
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
        .eq("event_id", event.id)
        .throwOnError();

      const teamNames = [
        ...new Set(
          data?.flatMap((match) =>
            match.teams.map((t) => normalizeTeamName(t.team_name)),
          ) ?? [],
        ),
      ];

      const { data: teamAvatars } = await supabase
        .from("teams")
        .select("name, avatar")
        .in("name", teamNames)
        .throwOnError();

      const matchesWithAvatars = data?.map((match) => ({
        ...match,
        teams: match.teams.map((team) => {
          const normalizedName = normalizeTeamName(team.team_name);
          return {
            ...team,
            avatar:
              teamAvatars?.find((t) => t.name === normalizedName)?.avatar ??
              null,
          };
        }),
      }));

      const sortedMatches = orderBy(
        matchesWithAvatars ?? [],
        [(match) => getTime(match.started_at ?? 0)],
        ["desc"],
      );

      return sortedMatches;
    },
  });

  if (isLoading) return <EventMatchesSkeleton />;

  if (!matches || matches.length === 0) {
    return (
      <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconTrophy className="text-yellow-400/60" />
              </EmptyMedia>
              <EmptyTitle>No Matches Yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <ItemGroup>
      {matches.map((match) => {
        const faction1 = match.teams[0];
        const faction2 = match.teams[1];

        return (
          <Item
            key={match.match_id}
            variant="outline"
            className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm [a]:hover:bg-neutral-900/30"
            render={
              <Link href={`/events/${event.slug}/matches/${match.match_id}`} />
            }
          >
            <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />

            <div className="grid w-full grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-4">
              <ItemMedia variant="image">
                <Avatar size="lg" className="rounded-md after:rounded-md">
                  <AvatarImage
                    className="rounded-md"
                    src={faction1.avatar ?? undefined}
                  />
                  <AvatarFallback className="rounded-md">
                    {normalizeTeamName(faction1.team_name).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>

              <ItemContent>
                <ItemTitle className="transition-colors group-hover/item:text-red-500">
                  {normalizeTeamName(faction1.team_name)}
                </ItemTitle>
              </ItemContent>

              <ItemContent className="shrink-0 items-center">
                <div className="flex items-center gap-2 font-black font-mono text-xl tabular-nums">
                  <span
                    className={cn({
                      "text-emerald-400": faction1?.is_winner === true,
                      "text-red-400": faction1?.is_winner === false,
                      "text-neutral-300": faction1?.is_winner == null,
                    })}
                  >
                    {match.score_faction1 ?? "—"}
                  </span>
                  <span className="text-neutral-700">:</span>
                  <span
                    className={cn({
                      "text-emerald-400": faction2?.is_winner === true,
                      "text-red-400": faction2?.is_winner === false,
                      "text-neutral-300": faction2?.is_winner == null,
                    })}
                  >
                    {match.score_faction2 ?? "—"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-wide">
                  {match.status} · Bo{match.best_of ?? match.maps.length}
                </span>
              </ItemContent>

              <ItemContent className="items-end text-right">
                <ItemTitle className="transition-colors group-hover/item:text-red-500">
                  {normalizeTeamName(faction2.team_name)}
                </ItemTitle>
              </ItemContent>

              <ItemMedia variant="image">
                <Avatar size="lg" className="rounded-md after:rounded-md">
                  <AvatarImage
                    className="rounded-md"
                    src={faction2.avatar ?? undefined}
                  />
                  <AvatarFallback className="rounded-md">
                    {normalizeTeamName(faction2.team_name).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
            </div>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
