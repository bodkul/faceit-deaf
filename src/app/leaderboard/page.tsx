"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import { range } from "lodash-es";
import { useRouter } from "next/navigation";

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
import { usePlayersWithPagination } from "@/hooks/usePlayers";

const PAGE_SIZE = 20;

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
