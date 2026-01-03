"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { range } from "lodash-es";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SkillLevelIcon } from "@/components/icons";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { supabaseClient } from "@/lib/supabase";
import type { Tables } from "@/types/database";

const PAGE_SIZE = 20;

type LeaderboardPlayer = Tables<"leaderboard_players"> & {
  id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  faceit_elo: number;
};

function usePlayers(pagination: ReturnType<typeof usePagination>) {
  return useQuery({
    queryKey: ["leaderboard_players", pagination.pageOffset],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("leaderboard_players")
        .select(
          "id, nickname, avatar, skill_level, faceit_elo, elo_before, country",
        )
        .order("faceit_elo", { ascending: false })
        .range(
          pagination.pageOffset * PAGE_SIZE,
          (pagination.pageOffset + 1) * PAGE_SIZE - 1,
        )
        .overrideTypes<LeaderboardPlayer[]>();
      return data;
    },
  });
}

function usePlayersWithPagination() {
  const [totalCount, setTotalCount] = useState(0);
  const pagination = usePagination(totalCount, PAGE_SIZE);
  const { data: count } = useQuery({
    queryKey: ["leaderboard_players_count"],
    queryFn: async () => {
      const { count } = await supabaseClient
        .from("leaderboard_players")
        .select("id", { count: "exact", head: true });
      return count;
    },
  });
  const query = usePlayers(pagination);

  if (typeof count === "number" && count !== totalCount) {
    setTotalCount(count);
  }

  return {
    ...query,
    count,
    ...pagination,
  };
}

type PlayerWithPagination = NonNullable<
  Awaited<ReturnType<typeof usePlayers>>["data"]
>[number];

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

export default function LeaderboardPage() {
  const router = useRouter();

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

  const columns = useMemo<ColumnDef<LeaderboardPlayer>[]>(
    () => [
      {
        header: "Ranking",
        cell: (props) => {
          return props.row.index + 1;
        },
      },
      {
        header: "Player",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            {row.original.country ? (
              <Image
                alt={`${row.original.country} flag`}
                className="h-2.5 w-3.75 rounded-xs"
                height={10}
                src={`https://flagcdn.com/w20/${row.original.country.toLowerCase()}.png`}
                width={15}
              />
            ) : (
              <div className="h-2.5 w-3.75 rounded-xs bg-neutral-700" />
            )}
            <div className="font-medium">{row.original.nickname}</div>
          </div>
        ),
      },
      {
        header: "Skill level",
        cell: ({ row }) => (
          <SkillLevelIcon className="size-6" level={row.original.skill_level} />
        ),
      },
      {
        header: "ELO",
        cell: ({ row }) => (
          <>
            {row.original.faceit_elo}
            <EloDelta player={row.original} />
          </>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
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
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      className="cursor-pointer"
                      key={row.id}
                      onClick={() =>
                        router.push(`/player/${row.original.nickname}`)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : range(PAGE_SIZE).map((index) => (
                    <TableRow key={index}>
                      <TableCell>{offset + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-2.5 w-3.75 rounded-xs" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="size-6 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
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
                  className="h-8 w-8 p-0"
                  disabled={!canPreviousPage}
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
                  disabled={!canPreviousPage}
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
                  disabled={!canNextPage}
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
                  disabled={!canNextPage}
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
