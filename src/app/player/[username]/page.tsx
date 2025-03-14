"use client";

import "@/config/dateConfig";

import { formatRelative } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FaceitIcon, SteamIcon, TwitchIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useMatchHistory from "@/hooks/queries/useMatchHistory";
import usePlayer from "@/hooks/queries/usePlayer";
import usePlayerStats from "@/hooks/queries/usePlayerStats";
import usePlayersSubscription from "@/hooks/subscriptions/usePlayersSubscription";
import { cn } from "@/lib/utils";

import renderLoadingRows from "./components/renderLoadingRows";
import Stat from "./components/stat";
import Loading from "./loading";

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
  const { data: matchHistory, count: countMatchHistory } = useMatchHistory(
    player?.id,
  );

  usePlayersSubscription(async () => {
    await mutatePlayer();
  });

  if (isLoadingPlayer) {
    return Loading();
  }

  if (!player) {
    return notFound();
  }

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
              name="K/D"
              value={playerStats?.kd_ratio.toFixed(2) ?? "0.00"}
              isLoading={!playerStats}
            />
            <Stat
              name="HS %"
              value={playerStats?.avg_headshots.toFixed(2) ?? "0.00"}
              isLoading={!playerStats}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <CardDescription>
            {countMatchHistory ?? 0} matches played
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {matchHistory?.map((match) => {
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
                            "text-[#929a9e]": kd && kd >= 0.95 && kd <= 1.05,
                          })}
                        >
                          {kd?.toFixed(2) ?? <Skeleton className="h-5 w-8" />}
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-8" />
                        </TableCell>
                      </TableRow>
                    </Link>
                  );
                }) ?? renderLoadingRows(20)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
