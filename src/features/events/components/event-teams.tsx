"use client";

import { IconTrophy } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import Link from "next/link";

import {
  diffTone,
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { TeamAvatar } from "@/components/team-avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loading } from "@/features/events/components/event-table-skeleton";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import type { EventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { formatNumberWithSign } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function fetchEventTeams(eventId: string) {
  const { data: matches } = await supabase
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
    .eq("event_id", eventId)
    .throwOnError();

  const totals = new Map<
    string,
    {
      name: string;
      wins: number;
      losses: number;
      maps: number;
      kills: number;
      deaths: number;
    }
  >();

  for (const match of matches) {
    for (const team of match.teams) {
      const name = normalizeTeamName(team.team_name);
      const stats = totals.get(name) ?? {
        name,
        wins: 0,
        losses: 0,
        maps: 0,
        kills: 0,
        deaths: 0,
      };

      if (team.is_winner === true) stats.wins++;
      if (team.is_winner === false) stats.losses++;
      stats.maps += match.maps.length;

      for (const map of match.maps) {
        for (const player of map.player_stats) {
          if (player.faction_id === team.faction_id) {
            stats.kills += player.kills ?? 0;
            stats.deaths += player.deaths ?? 0;
          }
        }
      }

      totals.set(name, stats);
    }
  }

  const { data: teamAvatars } = await supabase
    .from("teams")
    .select("name, avatar")
    .in("name", [...totals.keys()])
    .throwOnError();

  const avatarByName = new Map(teamAvatars.map((t) => [t.name, t.avatar]));

  return [...totals.values()]
    .map((team) => ({
      ...team,
      avatar: avatarByName.get(team.name) ?? null,
      kd: team.deaths > 0 ? team.kills / team.deaths : team.kills,
      kd_diff: team.kills - team.deaths,
    }))
    .sort(
      (a, b) => b.wins - a.wins || a.losses - b.losses || b.kd_diff - a.kd_diff,
    );
}

export function EventTeamsClient({ event }: { event: EventBySlug }) {
  const queryKey = queryKeys.events.teams(event.id);
  useRealtime(queryKey, eventSources);

  const { data: teams, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchEventTeams(event.id),
  });

  if (isLoading) return <Loading rows={8} />;

  if (!teams?.length) {
    return (
      <Empty className="rounded-xl border border-border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTrophy />
          </EmptyMedia>
          <EmptyTitle>No teams yet</EmptyTitle>
          <EmptyDescription>
            Standings appear after the first match.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <StatsTable minWidth={560}>
        <thead className="border-border border-b">
          <tr>
            <StatsTh sticky align="left">
              Team
            </StatsTh>
            <StatsTh align="center">W – L</StatsTh>
            <StatsTh>Maps</StatsTh>
            <StatsTh>+/-</StatsTh>
            <StatsTh>K/D</StatsTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {teams.map((team, index) => (
            <tr
              key={team.name}
              className="transition-colors hover:bg-foreground/[0.03]"
            >
              <StatsTd sticky align="left" numeric={false}>
                <Link
                  href={`/events/${event.slug}/teams/${encodeURIComponent(team.name)}`}
                  className="flex items-center gap-3 font-semibold transition-colors hover:text-primary"
                >
                  <span
                    className={cn(
                      "w-5 shrink-0 text-right font-mono text-xs tabular-nums",
                      index < 3 ? "text-warning" : "text-faint",
                    )}
                  >
                    {index + 1}
                  </span>
                  <TeamAvatar
                    name={team.name}
                    src={team.avatar}
                    className="size-8"
                  />
                  <span className="max-w-40 truncate">{team.name}</span>
                </Link>
              </StatsTd>
              <StatsTd align="center">
                <span className="text-win">{team.wins}</span>
                <span className="text-faint"> – </span>
                <span className="text-loss">{team.losses}</span>
              </StatsTd>
              <StatsTd tone="muted">{team.maps}</StatsTd>
              <StatsTd tone={diffTone(team.kd_diff)} className="font-semibold">
                {formatNumberWithSign(team.kd_diff)}
              </StatsTd>
              <StatsTd tone={ratioTone(team.kd)}>{team.kd.toFixed(2)}</StatsTd>
            </tr>
          ))}
        </tbody>
      </StatsTable>
    </div>
  );
}
