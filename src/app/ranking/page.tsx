"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconTrophy,
} from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { SkillLevelIcon } from "@/components/icons";
import { renderRankingLoadingRows } from "@/components/render-loading-rows";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayersWithPagination } from "@/hooks/usePlayers";
import { getCountryFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import type { PlayerWithPagination } from "@/types/player";

const PAGE_SIZE = 20;

function EloDelta({ player }: { player: PlayerWithPagination }) {
  if (player.elo_before == null || player.faceit_elo == null) {
    return null;
  }

  const difference = player.faceit_elo - player.elo_before;
  if (difference === 0) return null;

  const color = difference > 0 ? "text-green-500" : "text-red-500";

  return (
    <>
      {" "}
      <sup className={color}>{formatNumberWithSign(difference)}</sup>
    </>
  );
}

function PlayerRow({
  player,
  index,
}: {
  player: PlayerWithPagination;
  index: number;
}) {
  const router = useRouter();

  return (
    <TableRow
      key={player.id}
      className="cursor-pointer"
      onClick={() => router.push(`/player/${player.nickname}`)}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {player.country ? (
            <Image
              className="h-2.5 w-3.75 rounded-xs"
              src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
              width={15}
              height={10}
              alt={`${player.country} flag`}
            />
          ) : (
            <div className="h-2.5 w-3.75 rounded-xs bg-neutral-700" />
          )}
          <div className="font-medium">{player.nickname}</div>
        </div>
      </TableCell>
      <TableCell>
        <SkillLevelIcon level={player.skill_level} className="size-6" />
      </TableCell>
      <TableCell>
        {player.faceit_elo}
        <EloDelta player={player} />
      </TableCell>
    </TableRow>
  );
}

function TableContent({
  data,
  offset,
  isLoading,
}: {
  data: PlayerWithPagination[] | null | undefined;
  offset: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return renderRankingLoadingRows(PAGE_SIZE, offset);
  }

  if (!data || data.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="h-100">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconTrophy />
              </EmptyMedia>
              <EmptyTitle>No players found</EmptyTitle>
              <EmptyDescription>
                There are no players in the ranking yet
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {data?.map((player, index) => (
        <PlayerRow key={player.id} player={player} index={offset + index} />
      ))}
    </>
  );
}

export default function RankingPage() {
  const {
    data,
    totalPages,
    canPreviousPage,
    canNextPage,
    pageIndex,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    isLoading,
  } = usePlayersWithPagination();

  const offset = (pageIndex - 1) * PAGE_SIZE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking</CardTitle>
        <CardDescription>Player rankings by FACEIT ELO</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Skill level</TableHead>
                <TableHead>ELO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableContent data={data} offset={offset} isLoading={isLoading} />
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <Pagination>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-25 items-center justify-center font-medium text-sm">
              Page {pageIndex} of {totalPages}
            </div>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => firstPage?.()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft data-icon="inline-end" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => previousPage?.()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft data-icon="inline-end" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => nextPage?.()}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight data-icon="inline-end" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => lastPage?.()}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight data-icon="inline-end" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </div>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
