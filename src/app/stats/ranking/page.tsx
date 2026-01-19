"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconTrophy,
} from "@tabler/icons-react";

import { PlayerRow } from "@/components/leaderboard/player-row";
import { renderLoadingRows } from "@/components/leaderboard/render-loading-rows";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlayersWithPagination } from "@/hooks/usePlayers";

const PAGE_SIZE = 20;

function EloRanking() {
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
  } = usePlayersWithPagination();

  const offset = (pageIndex - 1) * PAGE_SIZE;

  return (
    <>
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
      <div className="mt-4">
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
      </div>
    </>
  );
}

function EventRanking() {
  // TODO: Implement event-based ranking when data is available
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconTrophy />
        </EmptyMedia>
        <EmptyTitle>Coming soon</EmptyTitle>
        <EmptyDescription>
          Event rankings will be available here. Check out individual{" "}
          <a href="/events" className="text-orange-500 hover:underline">
            events
          </a>{" "}
          for tournament results.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default function RankingPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ranking</CardTitle>
        <CardDescription>
          Player rankings by FACEIT ELO and tournament performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="elo">
          <TabsList className="mb-4">
            <TabsTrigger value="elo">ELO</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="elo">
            <EloRanking />
          </TabsContent>

          <TabsContent value="events">
            <EventRanking />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
