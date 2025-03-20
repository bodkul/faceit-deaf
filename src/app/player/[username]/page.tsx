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
import { cn } from "@/lib/utils";

import renderLoadingRows from "./components/renderLoadingRows";
import Stat from "./components/stat";
import Loading from "./loading";

type Match = {
  Rounds: string;
  Assists: string;
  Deaths: string;
  Kills: string;
  Headshots: string;
  ADR: string;
  "K/R Ratio": string;
};

const calculateAverageStats = (matches: Match[]) => {
  const DMG_PER_KILL = 105;
  const TRADE_PERCENT = 0.2;

  const weight = matches.length;

  if (weight === 0) {
    return {
      kills: 0,
      deaths: 0,
      kd: 0,
      dpr: 0,
      kpr: 0,
      avgk: 0,
      adr: 0,
      hs: 0,
      hsp: 0,
      apr: 0,
      kast: 0,
      impact: 0,
      rating: 0,
      weight,
    };
  }

  const matchStats = matches.map((match) => {
    return {
      kills: Number(match["Kills"]),
      deaths: Number(match["Deaths"]),
      rounds: Number(match["Rounds"]),
      kpr: Number(match["K/R Ratio"]),
      adr: Number(match["ADR"]) || Number(match["K/R Ratio"]) * DMG_PER_KILL,
      headshots: Number(match["Headshots"]),
      assists: Number(match["Assists"]),
    };
  });

  const kills = matchStats.reduce((prev, stat) => prev + stat.kills, 0);
  const deaths = matchStats.reduce((prev, stat) => prev + stat.deaths, 0);
  const kd = kills / deaths || 0;

  const dpr =
    matchStats.reduce((prev, stat) => prev + stat.deaths / stat.rounds, 0) /
    weight;
  const kpr = matchStats.reduce((prev, stat) => prev + stat.kpr, 0) / weight;
  const avgk = kills / weight;
  const adr = matchStats.reduce((prev, stat) => prev + stat.adr, 0) / weight;

  const hs = matchStats.reduce((prev, stat) => prev + stat.headshots, 0);
  const hsp = (hs / kills) * 100;
  const apr =
    matchStats.reduce((prev, stat) => prev + stat.assists / stat.rounds, 0) /
    weight;

  const kast =
    matchStats.reduce((prev, stat) => {
      const survived = stat.rounds - stat.deaths;
      const traded = TRADE_PERCENT * stat.rounds;
      const sum = (stat.kills + stat.assists + survived + traded) * 0.45;
      return prev + Math.min((sum / stat.rounds) * 100, 100);
    }, 0) / weight;

  const impact = Math.max(2.13 * kpr + 0.42 * apr - 0.41, 0);
  const rating = Math.max(
    0.0073 * kast +
      0.3591 * kpr +
      -0.5329 * dpr +
      0.2372 * impact +
      0.0032 * adr +
      0.1587,
    0,
  );

  return {
    kills,
    deaths,
    kd,
    dpr,
    kpr,
    avgk,
    adr,
    hs,
    hsp,
    apr,
    kast,
    impact,
    rating,
    weight,
  };
};

export default function Page({
  params: { username },
}: {
  params: { username: string };
}) {
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
