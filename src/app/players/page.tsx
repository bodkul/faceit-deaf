import { IconUsers } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";

import { FaceitLevelIcon } from "@/components/icons";
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
import { getCountryFlagUrl } from "@/lib/country";
import { getPlayerRankings } from "@/lib/db/players/queries";

import { PlayersPagination } from "./players-pagination";

const PAGE_SIZE = 20;

function parsePage(raw: string | undefined): number {
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

function PlayerRankRow({
  player,
  rank,
}: {
  player: Awaited<ReturnType<typeof getPlayerRankings>>["players"][number];
  rank: number;
}) {
  return (
    <Item
      variant="outline"
      size="sm"
      className="bg-muted/50 [a]:hover:bg-muted/70"
      render={<Link href={`/player/${player.nickname}`} />}
    >
      <span className="tabular-nums">#{rank}</span>

      <ItemMedia variant="image">
        <Avatar size="lg" className="after:rounded-lg">
          <AvatarImage src={player.avatar ?? undefined} alt={player.nickname} />
          <AvatarFallback>{player.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent>
        <ItemTitle>
          {player.nickname}
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
        <FaceitLevelIcon elo={player.faceit_elo} className="size-5 shrink-0" />
      </ItemContent>
    </Item>
  );
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
      <Card>
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
      <ItemGroup>
        {players.map((player, index) => (
          <PlayerRankRow
            key={player.id}
            player={player}
            rank={(currentPage - 1) * PAGE_SIZE + index + 1}
          />
        ))}
      </ItemGroup>

      {totalPages > 1 && (
        <PlayersPagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </motion.div>
  );
}
