import { IconUsers } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";

import { FaceitLevelIcon } from "@/components/icons";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
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
import { PlayersPagination } from "@/features/player/components/players-pagination";
import { getPlayerRankings } from "@/features/player/queries";
import { getCountryFlagUrl } from "@/lib/country";
import { topics } from "@/lib/realtime/topics";

const PAGE_SIZE = 20;

function parsePage(raw: string | undefined): number {
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { players, count } = await getPlayerRankings(PAGE_SIZE, offset);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  if (players.length === 0) {
    return (
      <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconUsers />
              </EmptyMedia>
              <EmptyTitle>No players</EmptyTitle>
              <EmptyDescription>
                No players found in the rankings.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      key={currentPage}
      className="flex flex-col space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <RealtimeRefresh sources={[topics.players]} />
      <ItemGroup>
        {players.map((player, index) => {
          const rank = (currentPage - 1) * PAGE_SIZE + index + 1;

          return (
            <Item
              key={player.id}
              size="sm"
              variant="outline"
              className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm [a]:hover:bg-neutral-900/30"
              render={<Link href={`/player/${player.nickname}`} />}
            >
              <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />

              <span className="tabular-nums">#{rank}</span>

              <ItemMedia variant="image">
                <Avatar size="lg" className="after:rounded-lg">
                  <AvatarImage
                    src={player.avatar ?? undefined}
                    alt={player.nickname}
                  />
                  <AvatarFallback>{player.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>

              <ItemContent>
                <ItemTitle>
                  <span className="transition-colors group-hover/item:text-red-500">
                    {player.nickname}
                  </span>
                  {player.country && (
                    <Image
                      className="rounded-xs"
                      src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
                      width={15}
                      height={10}
                      alt={player.country}
                    />
                  )}
                </ItemTitle>
              </ItemContent>

              <ItemContent className="flex-row items-center">
                <span className="text-right font-bold font-mono text-neutral-200 text-sm tabular-nums md:text-base">
                  {player.faceit_elo}
                </span>
                <FaceitLevelIcon elo={player.faceit_elo} className="size-5" />
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>

      {totalPages > 1 && (
        <PlayersPagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </motion.div>
  );
}
