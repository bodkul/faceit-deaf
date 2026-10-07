"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
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
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Loading } from "@/features/events/components/event-table-skeleton";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import type { EventBySlug } from "@/features/events/queries";
import { formatNumberWithSign } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { supabaseClient } from "@/lib/supabase";

export function EventTeamsClient({ event }: { event: EventBySlug }) {
  const { data: teams, isLoading } = useQuery({
    queryKey: queryKeys.events.teams(event.id),
    queryFn: async () => {
      const { data: matches } = await supabaseClient
        .from("event_matches")
        .select(`
        match_id,
        maps:event_match_maps (
          id,
          player_stats:event_map_player_stats (
            faction_id,
            kills,
            deaths
          )
        ),
        teams:event_match_teams (
          faction_id,
          team_name,
          is_winner
        )
      `)
        .eq("event_id", event.id)
        .throwOnError();

      const teamStats = new Map<
        string,
        {
          name: string;
          maps: number;
          kills: number;
          deaths: number;
        }
      >();

      for (const match of matches) {
        for (const team of match.teams) {
          const teamName = normalizeTeamName(team.team_name);

          const stats = teamStats.get(teamName) ?? {
            name: teamName,
            maps: 0,
            kills: 0,
            deaths: 0,
          };

          stats.maps += match.maps.length;

          for (const map of match.maps) {
            for (const player of map.player_stats) {
              if (player.faction_id === team.faction_id) {
                stats.kills += player.kills ?? 0;
                stats.deaths += player.deaths ?? 0;
              }
            }
          }

          teamStats.set(teamName, stats);
        }
      }

      const teamNames = [...teamStats.keys()];

      const { data: teamAvatars } = await supabaseClient
        .from("teams")
        .select("name, avatar")
        .in("name", teamNames)
        .throwOnError();

      return [...teamStats.values()]
        .map((team) => ({
          ...team,
          avatar:
            teamAvatars?.find((t) => t.name === team.name)?.avatar ?? null,
          kd: team.deaths > 0 ? team.kills / team.deaths : team.kills,
          kd_diff: team.kills - team.deaths,
        }))
        .sort((a, b) => b.kd_diff - a.kd_diff);
    },
  });

  if (isLoading) return <Loading />;

  if (!teams || teams.length === 0) {
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
              <EmptyTitle>No Teams Yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <ItemGroup>
      {teams.map((team, index) => (
        <Item
          key={team.name}
          size="sm"
          className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm [a]:hover:bg-neutral-900/30"
          render={<Link href={`/events/${event.slug}/teams/${team.name}`} />}
        >
          <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />

          <span className="tabular-nums">#{index + 1}</span>

          <ItemMedia variant="image" className="self-center!">
            <Avatar className="rounded-md after:rounded-md">
              <AvatarImage
                className="rounded-md"
                src={team.avatar ?? undefined}
              />
              <AvatarFallback className="rounded-md">
                {team.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>

          <ItemContent>
            <ItemTitle className="transition-colors group-hover/item:text-red-500">
              {team.name}
            </ItemTitle>
          </ItemContent>

          <ItemContent className="items-center">
            <ItemTitle>Maps</ItemTitle>
            <ItemDescription>{team.maps}</ItemDescription>
          </ItemContent>

          <ItemContent className="items-center">
            <ItemTitle>K-D Diff</ItemTitle>
            <ItemDescription
              className={cn({
                "text-emerald-400": team.kd_diff >= 1,
                "text-red-400": team.kd_diff < 1,
              })}
            >
              {formatNumberWithSign(team.kd_diff)}
            </ItemDescription>
          </ItemContent>

          <ItemContent className="items-center">
            <ItemTitle>K/D</ItemTitle>
            <ItemDescription
              className={cn({
                "text-emerald-400": team.kd >= 1,
                "text-red-400": team.kd < 1,
              })}
            >
              {team.kd.toFixed(2)}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
