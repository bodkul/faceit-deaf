"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import usePlayersWithPagination from "@/hooks/queries/usePlayers";
import usePlayersSubscription from "@/hooks/subscriptions/usePlayersSubscription";

import { PlayerRow, renderLoadingRows } from ".";

const PAGE_SIZE = 20;

export function Leardboard() {
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
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Elo</TableHead>
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

      <Pagination>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pageIndex} of {totalPages}
          </div>
          <PaginationContent className="gap-2">
            <PaginationItem>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => firstPage?.()}
                disabled={!canPreviousPage}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
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
                <ChevronLeft />
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
                <ChevronRight />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => lastPage?.()}
                disabled={!canNextPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </div>
      </Pagination>
    </div>
  );
}
