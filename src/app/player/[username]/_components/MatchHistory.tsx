"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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
import { usePagination } from "@/hooks/usePagination";
import { supabaseClient } from "@/lib/supabase";

import { MatchHistoryTableHead } from "./MatchHistoryTableHead";
import { MatchHistoryTableRow } from "./MatchHistoryTableRow";
import renderLoadingRows from "./renderLoadingRows";

const PAGE_SIZE = 20;

export default function MatchHistory({ playerId }: { playerId: string }) {
  const { data: count } = useQuery({
    queryKey: ["player-matches-count", playerId],
    enabled: Boolean(playerId),
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("player_matches")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("player_id", playerId);

      return count;
    },
  });

  const {
    pageIndex,
    totalPages,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    pageOffset,
  } = usePagination(count ?? 0, PAGE_SIZE);

  const { data: matches, isLoading } = useQuery({
    queryKey: ["player-matches", playerId, pageIndex],
    enabled: Boolean(playerId),
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("player_matches")
        .select()
        .eq("player_id", playerId)
        .order("finished_at", { ascending: false })
        .range(pageOffset * PAGE_SIZE, (pageOffset + 1) * PAGE_SIZE - 1);
      return data;
    },
  });

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
            <div className="flex w-25 items-center justify-center font-medium text-sm">
              Page {pageIndex} of {totalPages}
            </div>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <Button
                  className="h-8 w-8 p-0"
                  disabled={firstPage === null}
                  onClick={() => firstPage?.()}
                  variant="outline"
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  className="h-8 w-8 p-0"
                  disabled={previousPage === null}
                  onClick={() => previousPage?.()}
                  variant="outline"
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  className="h-8 w-8 p-0"
                  disabled={nextPage === null}
                  onClick={() => nextPage?.()}
                  variant="outline"
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  className="h-8 w-8 p-0"
                  disabled={lastPage === null}
                  onClick={() => lastPage?.()}
                  variant="outline"
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
