"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHistory,
} from "@tabler/icons-react";
import { useMemo } from "react";

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
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useMatchHistory } from "@/hooks/useMatchHistory";

import { MatchHistoryTableHead } from "./MatchHistoryTableHead";
import { MatchHistoryTableRow } from "./MatchHistoryTableRow";
import renderLoadingRows from "./renderLoadingRows";

export default function MatchHistory({ playerId }: { playerId: string }) {
  const {
    data: matches,
    isLoading,
    pageIndex,
    totalPages,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  } = useMatchHistory(playerId);

  const rows = useMemo(() => {
    if (isLoading) return renderLoadingRows(20);
    if (!matches?.length) return null;

    return matches.map((match) => (
      <MatchHistoryTableRow key={match.id} match={match} />
    ));
  }, [isLoading, matches]);

  if (!isLoading && !rows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>
            Complete list of all played matches with detailed statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconHistory />
              </EmptyMedia>
              <EmptyTitle>No matches yet</EmptyTitle>
              <EmptyDescription>
                Match history will appear here once played.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>
          Complete list of all played matches with detailed statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <MatchHistoryTableHead />
            </TableHeader>
            <TableBody>{rows}</TableBody>
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
                  disabled={firstPage === null}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => previousPage?.()}
                  disabled={previousPage === null}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => nextPage?.()}
                  disabled={nextPage === null}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => lastPage?.()}
                  disabled={lastPage === null}
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
