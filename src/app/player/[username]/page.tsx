"use client";

import "@/config/dateConfig";

import { formatRelative } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type JSX, use } from "react";

import { FaceitIcon, SteamIcon, TwitchIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import useMatchHistories from "@/hooks/queries/useMatchHistories";
import usePlayer from "@/hooks/queries/usePlayer";
import usePlayerStats from "@/hooks/queries/usePlayerStats";
import useMatchesSubscription from "@/hooks/subscriptions/useMatchesSubscription";
import usePlayersSubscription from "@/hooks/subscriptions/usePlayersSubscription";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { cn } from "@/lib/utils";

import renderLoadingRows from "./components/renderLoadingRows";
import Stat from "./components/stat";
import Loading from "./loading";

export default function Page(props: { params: Promise<{ username: string }> }) {
  const { username } = use(props.params);

  const {
    data: player,
    mutate: mutatePlayer,
    isLoading: isLoadingPlayer,
  } = usePlayer(username);
  const { data: playerStats } = usePlayerStats(player?.id);
  const {
    currentPage: matches,
    pageIndex,
    totalPages,
    firstPage,
    lastPage,
    previousPage,
    nextPage,
    isLoading: isLoadingMatches,
    isValidating,
    mutate: mutateMatches,
    count,
  } = useMatchHistories(player?.id);

  usePlayersSubscription(async () => {
    await mutatePlayer();
  });

  useMatchesSubscription(async () => {
    await mutateMatches();
  });

  if (isLoadingPlayer) {
    return Loading();
  }

  if (!player) {
    return notFound();
  }

  const stats = calculateAverageStats(
    playerStats?.flatMap((item) => {
      return {
        Rounds: String(item.rounds),
        Assists: item.assists,
        Deaths: item.deaths,
        Kills: item.kills,
        Headshots: item.headshots,
        ADR: item.adr,
        "K/R Ratio": item.kpr,
      };
    }) ?? [],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="size-20">
              <AvatarImage src={player.avatar} alt={player.nickname} />
              <AvatarFallback />
            </Avatar>
            <div className="flex flex-col space-y-3">
              <p className="text-2xl font-medium leading-none">
                {player.nickname}
              </p>
              <div className="flex space-x-1">
                {[
                  {
                    href: player.faceit_url.replace("{lang}", "en"),
                    icon: <FaceitIcon className="size-4" />,
                  },
                  {
                    href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
                    icon: <SteamIcon className="size-4" />,
                  },
                  player.twitch_username
                    ? {
                        href: `https://www.twitch.tv/${player.twitch_username}`,
                        icon: <TwitchIcon className="size-4" />,
                      }
                    : null,
                ]
                  .filter(
                    (item): item is { href: string; icon: JSX.Element } =>
                      !!item,
                  )
                  .map(({ href, icon }, index) => (
                    <div key={index} className="flex rounded-md border size-6">
                      <Link className="m-auto" href={href} target="_blank">
                        {icon}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Stat name="Elo" value={player?.faceit_elo} isLoading={!player} />
            <Stat
              name="Rating 2.0"
              value={stats?.rating.toFixed(2) ?? "0.00"}
              isLoading={!playerStats}
            />
            <Stat
              name="K/D"
              value={stats?.kd.toFixed(2) ?? "0.00"}
              isLoading={!playerStats}
            />
            <Stat
              name="HS %"
              value={stats?.hsp.toFixed(2) ?? "0.00"}
              isLoading={!playerStats}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Histories</CardTitle>
          <CardDescription>{count ?? 0} matches played</CardDescription>
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
                  {!isLoadingMatches && !isValidating
                    ? matches?.map((match) => {
                        const team = match.team[0];
                        const player_stats = team.team_players[0].player_stats;
                        const kills = Number(player_stats?.Kills ?? 0);
                        const deaths = Number(player_stats?.Deaths ?? 0);

                        const kd = player_stats ? kills / deaths : undefined;

                        return (
                          <Link
                            key={match.id}
                            href={`/match/${match.id}`}
                            legacyBehavior
                          >
                            <TableRow
                              className={cn("cursor-pointer !border-r-4", {
                                "border-r-red-500": team.team_win === false,
                                "border-r-green-500": team.team_win === true,
                              })}
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
                                  "text-[#929a9e]":
                                    kd && kd >= 0.95 && kd <= 1.05,
                                })}
                              >
                                {kd?.toFixed(2) ?? (
                                  <Skeleton className="h-5 w-8" />
                                )}
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
                          </Link>
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
    </>
  );
}
