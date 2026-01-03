"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

import { PlayerRow } from "@/components/leaderboard/player-row";
import { renderLoadingRows } from "@/components/leaderboard/render-loading-rows";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayersWithPagination } from "@/hooks/usePlayers";
import { usePlayersSubscription } from "@/hooks/usePlayersSubscription";

const PAGE_SIZE = 20;

export default function LeaderboardPage() {
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
    mutate,
  } = usePlayersWithPagination();

  usePlayersSubscription(async () => {
    await mutate();
  });

  const offset = (pageIndex - 1) * PAGE_SIZE;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ranking</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Skill level</TableHead>
                <TableHead>ELO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((player, index) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  index={offset + index}
                />
              )) ?? renderLoadingRows(PAGE_SIZE, offset)}
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
                  className="h-8 w-8 p-0"
                  onClick={() => firstPage?.()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => previousPage?.()}
                  disabled={!canPreviousPage}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => nextPage?.()}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => lastPage?.()}
                  disabled={!canNextPage}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </div>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
