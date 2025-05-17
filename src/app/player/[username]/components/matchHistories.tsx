"use client";

import { formatRelative } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import useMatchHistories from "@/hooks/queries/useMatchHistories";
import useMatchesSubscription from "@/hooks/subscriptions/useMatchesSubscription";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { cn } from "@/lib/utils";

import renderLoadingRows from "./renderLoadingRows";

export default function MatchHistories({ playerId }: { playerId: string }) {
  const router = useRouter();

  const {
    data,
    pageIndex,
    totalPages,
    firstPage,
    lastPage,
    previousPage,
    nextPage,
    isLoading,
    mutate,
  } = useMatchHistories(playerId);

  useMatchesSubscription(() => mutate().then());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Histories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Date</TableHead>
                  <TableHead className="w-[16%]">Map</TableHead>
                  <TableHead className="w-[16%]">Score</TableHead>
                  <TableHead className="w-[16%]">K - D</TableHead>
                  <TableHead className="w-[16%]">K/D</TableHead>
                  <TableHead className="w-[16%]">Rating 2.0</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoading
                  ? data?.map((match) => {
                      const team = match.team[0];
                      const player_stats = team.team_players[0].player_stats;
                      const kills = Number(player_stats?.Kills ?? 0);
                      const deaths = Number(player_stats?.Deaths ?? 0);

                      const kd = player_stats ? kills / deaths : undefined;

                      return (
                        <TableRow
                          key={match.id}
                          className={cn(
                            "cursor-pointer !border-r-4 whitespace-nowrap",
                            {
                              "border-r-red-500": team.team_win === false,
                              "border-r-green-500": team.team_win === true,
                            },
                          )}
                          onClick={() => router.push(`/match/${match.id}`)}
                        >
                          <TableCell>
                            {match.finished_at ? (
                              formatRelative(match.finished_at, new Date())
                            ) : (
                              <Skeleton className="h-5 w-24" />
                            )}
                          </TableCell>
                          <TableCell className="text-[#87a3bf] capitalize">
                            {match.map_pick?.replace("de_", "") ?? (
                              <Skeleton className="h-5 w-12" />
                            )}
                          </TableCell>
                          <TableCell>
                            {match.round_score ?? (
                              <Skeleton className="h-5 w-10" />
                            )}
                          </TableCell>
                          <TableCell>
                            {player_stats?.Kills && player_stats?.Deaths ? (
                              `${player_stats.Kills} - ${player_stats.Deaths}`
                            ) : (
                              <Skeleton className="h-5 w-12" />
                            )}
                          </TableCell>
                          <TableCell
                            className={cn("font-semibold", {
                              "text-red-500": kd && kd < 0.95,
                              "text-green-500": kd && kd > 1.05,
                              "text-[#929a9e]": kd && kd >= 0.95 && kd <= 1.05,
                            })}
                          >
                            {kd?.toFixed(2) ?? <Skeleton className="h-5 w-8" />}
                          </TableCell>
                          <TableCell>
                            {player_stats ? (
                              calculateAverageStats([
                                {
                                  Rounds:
                                    match.round_score
                                      ?.split(" / ")
                                      .map(Number)
                                      .reduce((a, b) => a + b, 0)
                                      .toString() ?? "0",
                                  Assists: player_stats.Assists,
                                  Kills: player_stats.Kills,
                                  Deaths: player_stats.Deaths,
                                  Headshots: player_stats.Headshots,
                                  ADR: player_stats.ADR,
                                  "K/R Ratio": player_stats["K/R Ratio"],
                                },
                              ]).rating.toFixed(2)
                            ) : (
                              <Skeleton className="h-5 w-8" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : renderLoadingRows(20)}
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
                    disabled={firstPage === null}
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
                    disabled={previousPage === null}
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
                    disabled={nextPage === null}
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
                    disabled={lastPage === null}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </div>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
