"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHistory,
} from "@tabler/icons-react";

import {
  MatchesTableHead,
  MatchesTableRow,
} from "@/app/player/[username]/@tabs/_components/matches";
import { renderMatchHistoryLoadingRows } from "@/components/render-loading-rows";
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

function MatchHistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>
          Complete list of all played matches with detailed statistics
        </CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}

export function MatchHistorySkeleton() {
  return (
    <MatchHistoryLayout>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <MatchesTableHead />
            </TableHeader>
            <TableBody>{renderMatchHistoryLoadingRows(20)}</TableBody>
          </Table>
        </div>
      </CardContent>
    </MatchHistoryLayout>
  );
}

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

  if (isLoading) return <MatchHistorySkeleton />;

  if (!matches) {
    return (
      <MatchHistoryLayout>
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
      </MatchHistoryLayout>
    );
  }

  return (
    <MatchHistoryLayout>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <MatchesTableHead />
            </TableHeader>
            <TableBody>
              {matches?.map((match) => (
                <MatchesTableRow key={match.id} match={match} />
              ))}
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
                  disabled={firstPage === null}
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
                  disabled={previousPage === null}
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
                  disabled={nextPage === null}
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
                  disabled={lastPage === null}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight data-icon="inline-end" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </div>
        </Pagination>
      </CardFooter>
    </MatchHistoryLayout>
  );
}
