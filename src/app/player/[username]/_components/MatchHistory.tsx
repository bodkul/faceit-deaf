"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useMemo } from "react";

import { MatchHistoryTableHead } from "./MatchHistoryTableHead";
import { MatchHistoryTableRow } from "./MatchHistoryTableRow";
import renderLoadingRows from "./renderLoadingRows";
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
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useMatchesSubscription } from "@/hooks/useMatchesSubscription";
import { useMatchHistory } from "@/hooks/useMatchHistory";

export default function MatchHistory({ playerId }: { playerId: string }) {
  const {
    matches,
    isLoading,
    pageIndex,
    totalPages,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    mutate,
  } = useMatchHistory(playerId);

  useMatchesSubscription(() => mutate().then());

  const rows = useMemo(() => {
    if (isLoading) return renderLoadingRows(20);
    if (!matches?.length) return null;

    return matches.map((match) => (
      <MatchHistoryTableRow key={match.id} match={match} />
    ));
  }, [isLoading, matches]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
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
            <div className="flex w-25 items-center justify-center text-sm font-medium">
              Page {pageIndex} of {totalPages}
            </div>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0"
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
                  className="h-8 w-8 p-0"
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
