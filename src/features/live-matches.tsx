"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { differenceInMinutes } from "date-fns";
import { now } from "lodash-es";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Tables } from "@/types/database";

function useLiveMatchSubscription() {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabaseClient.channel("live-matches");

    channelRef.current
      .on("broadcast", { event: "*" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live-matches"] });
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [queryClient]);
}

export function LiveMatches() {
  const router = useRouter();

  const columns = useMemo<ColumnDef<Tables<"live_matches">>[]>(
    () => [
      {
        header: "Live",
        meta: { headerClassName: "w-1/5" },
        accessorFn: (row) => {
          if (row.finished_at) return "Finished";
          if (row.started_at)
            return `${differenceInMinutes(now(), row.started_at)}m`;
          return "Soon";
        },
      },
      {
        header: "Score",
        meta: { headerClassName: "w-1/5" },
        accessorFn: (row) => row.round_score ?? "0 / 0",
      },
      {
        header: "Map",
        meta: {
          cellClassName: "text-[#87a3bf] capitalize",
          headerClassName: "w-1/5",
        },
        accessorFn: (row) => row.map_pick?.replace("de_", ""),
      },
      {
        header: "Players",
        meta: {
          cellClassName: "flex flex-wrap justify-center gap-1",
          headerClassName: "w-2/5",
        },
        accessorFn: (row) => row.players,
        cell: ({ getValue, row }) => {
          const players = getValue<string[] | null>();

          return players?.map((nickname) => (
            <Badge key={`${row.original.id}_${nickname}`} variant="outline">
              {nickname}
            </Badge>
          ));
        },
      },
    ],
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["live-matches"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("live_matches")
        .select("*")
        .order("status", { ascending: false })
        .order("started_at", { ascending: false });

      return data;
    },
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useLiveMatchSubscription();

  return (
    <Card className="h-min w-full">
      <CardHeader>
        <CardTitle>Live Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className={cn(
                        "text-center",
                        header.column.columnDef.meta?.headerClassName,
                      )}
                      key={header.id}
                    >
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    <Spinner className="inline-block" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="cursor-pointer whitespace-nowrap text-center"
                    key={row.id}
                    onClick={() => router.push(`/match/1-${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={cell.column.columnDef.meta?.cellClassName}
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
