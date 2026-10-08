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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Loading } from "@/features/events/components/event-table-skeleton";
import type { EventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { formatNumberWithSign } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

async function fetchEventPlayers(eventId: string) {
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
    .eq("event_id", eventId)
    .throwOnError();

  const totals = new Map<
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
        const stats = totals.get(player.player_id) ?? {
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

        totals.set(player.player_id, stats);
      }
    }
  }

  const { data: avatars } = await supabase
    .from("players")
    .select("id, avatar")
    .in("id", [...totals.keys()])
    .throwOnError();

  const avatarById = new Map(avatars.map((a) => [a.id, a.avatar]));

  return [...totals.values()]
    .map((player) => ({
      ...player,
      avatar: avatarById.get(player.player_id) ?? null,
      kd: player.deaths > 0 ? player.kills / player.deaths : player.kills,
      kd_diff: player.kills - player.deaths,
      adr: player.maps > 0 ? player.adr / player.maps : 0,
      hs: player.kills > 0 ? (player.headshots / player.kills) * 100 : 0,
    }))
    .sort((a, b) => b.kd_diff - a.kd_diff);
}

export function EventPlayersClient({ event }: { event: EventBySlug }) {
  const queryKey = queryKeys.events.players(event.id);
  useRealtime(queryKey, eventSources);

  const { data: players, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchEventPlayers(event.id),
  });

  if (isLoading) return <Loading />;

  if (!players?.length) {
    return (
      <Empty className="rounded-xl border border-border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconTrophy />
          </EmptyMedia>
          <EmptyTitle>No player stats yet</EmptyTitle>
          <EmptyDescription>
            Stats appear after the first map is played.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
      <StatsTable minWidth={760}>
        <thead className="border-border border-b">
          <tr>
            <StatsTh sticky align="left">
              Player
            </StatsTh>
            <StatsTh>Maps</StatsTh>
            <StatsTh>K</StatsTh>
            <StatsTh>D</StatsTh>
            <StatsTh>+/-</StatsTh>
            <StatsTh>K/D</StatsTh>
            <StatsTh>ADR</StatsTh>
            <StatsTh>HS%</StatsTh>
            <StatsTh>MVP</StatsTh>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {players.map((player, index) => (
            <tr
              key={player.player_id}
              className="transition-colors hover:bg-foreground/[0.03]"
            >
              <StatsTd sticky align="left" numeric={false}>
                <Link
                  href={`/events/${event.slug}/players/${player.player_id}`}
                  className="flex items-center gap-3 font-medium transition-colors hover:text-primary"
                >
                  <span
                    className={cn(
                      "w-5 shrink-0 text-right font-mono text-xs tabular-nums",
                      index < 3 ? "text-warning" : "text-faint",
                    )}
                  >
                    {index + 1}
                  </span>
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage src={player.avatar ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {player.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-32 truncate">{player.nickname}</span>
                </Link>
              </StatsTd>
              <StatsTd tone="muted">{player.maps}</StatsTd>
              <StatsTd tone="strong">{player.kills}</StatsTd>
              <StatsTd>{player.deaths}</StatsTd>
              <StatsTd
                tone={diffTone(player.kd_diff)}
                className="font-semibold"
              >
                {formatNumberWithSign(player.kd_diff)}
              </StatsTd>
              <StatsTd tone={ratioTone(player.kd)}>
                {player.kd.toFixed(2)}
              </StatsTd>
              <StatsTd>{player.adr.toFixed(1)}</StatsTd>
              <StatsTd>{player.hs.toFixed(0)}%</StatsTd>
              <StatsTd tone={player.mvps > 0 ? "warning" : "muted"}>
                {player.mvps}
              </StatsTd>
            </tr>
          ))}
        </tbody>
      </StatsTable>
    </div>
  );
}
