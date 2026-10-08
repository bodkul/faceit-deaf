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
import type { EventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { formatNumberWithSign } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function EventPlayersClient({ event }: { event: EventBySlug }) {
  useRealtime(queryKeys.events.players(event.id), eventSources);

  const { data: players, isLoading } = useQuery({
    queryKey: queryKeys.events.players(event.id),
    queryFn: async () => {
      const { data: matches } = await supabase
        .from("event_matches")
        .select(`
        match_id,
        maps:event_match_maps (
          id,
          player_stats:event_map_player_stats (
            player_id,
            nickname,
            kills,
            deaths,
            headshots,
            adr,
            mvps
          )
        )
      `)
        .eq("event_id", event.id)
        .throwOnError();

      const playerStats = new Map<
        string,
        {
          player_id: string;
          nickname: string;
          maps: number;
          kills: number;
          deaths: number;
          headshots: number;
          adr: number;
          mvps: number;
        }
      >();

      for (const match of matches) {
        for (const map of match.maps) {
          for (const player of map.player_stats) {
            const stats = playerStats.get(player.player_id) ?? {
              player_id: player.player_id,
              nickname: player.nickname,
              maps: 0,
              kills: 0,
              deaths: 0,
              headshots: 0,
              adr: 0,
              mvps: 0,
            };

            stats.maps++;
            stats.kills += player.kills ?? 0;
            stats.deaths += player.deaths ?? 0;
            stats.headshots += player.headshots ?? 0;
            stats.adr += player.adr ?? 0;
            stats.mvps += player.mvps ?? 0;

            playerStats.set(player.player_id, stats);
          }
        }
      }

      const playerIds = [...playerStats.keys()];

      const { data: avatars } = await supabase
        .from("players")
        .select("id, avatar")
        .in("id", playerIds)
        .throwOnError();

      return [...playerStats.values()]
        .map((player) => ({
          ...player,
          avatar:
            avatars?.find((a) => a.id === player.player_id)?.avatar ?? null,
          kd: player.deaths > 0 ? player.kills / player.deaths : player.kills,
          kd_diff: player.kills - player.deaths,
          adr: player.maps > 0 ? player.adr / player.maps : 0,
          hs: player.kills > 0 ? (player.headshots / player.kills) * 100 : 0,
        }))
        .sort((a, b) => b.kd_diff - a.kd_diff);
    },
  });

  if (isLoading) return <Loading />;

  if (!players || players.length === 0) {
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
              <EmptyTitle>No Players Yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <ItemGroup>
      {players.map((player, index) => (
        <Item
          key={player.nickname}
          size="sm"
          className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm [a]:hover:bg-neutral-900/30"
          render={
            <Link href={`/events/${event.slug}/players/${player.player_id}`} />
          }
        >
          <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />

          <span className="tabular-nums">#{index + 1}</span>

          <ItemMedia variant="image" className="self-center!">
            <Avatar size="lg" className="rounded-md after:rounded-lg">
              <AvatarImage
                className="rounded-md"
                src={player.avatar ?? undefined}
              />
              <AvatarFallback className="rounded-md">
                {player.nickname.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </ItemMedia>

          <ItemContent>
            <ItemTitle className="transition-colors group-hover/item:text-red-500">
              {player.nickname}
            </ItemTitle>
          </ItemContent>

          <ItemContent className="flex-1" />

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>Maps</ItemTitle>
            <ItemDescription>{player.maps}</ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>KD Diff</ItemTitle>
            <ItemDescription
              className={cn({
                "text-emerald-400": player.kd_diff >= 1,
                "text-red-400": player.kd_diff < 1,
              })}
            >
              {formatNumberWithSign(player.kd_diff)}
            </ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>K/D</ItemTitle>
            <ItemDescription
              className={cn({
                "text-emerald-400": player.kd >= 1,
                "text-red-400": player.kd < 1,
              })}
            >
              {player.kd.toFixed(2)}
            </ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>Kills</ItemTitle>
            <ItemDescription>{player.kills}</ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>Deaths</ItemTitle>
            <ItemDescription>{player.deaths}</ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>ADR</ItemTitle>
            <ItemDescription>{player.adr.toFixed(1)}</ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>HS%</ItemTitle>
            <ItemDescription>{player.hs.toFixed(1)}%</ItemDescription>
          </ItemContent>

          <ItemContent className="w-12 shrink-0 items-center">
            <ItemTitle>MVP</ItemTitle>
            <ItemDescription className="text-yellow-400">
              {player.mvps}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
