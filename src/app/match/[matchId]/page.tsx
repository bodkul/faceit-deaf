"use client";

import { format, formatDistanceStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useMatch from "@/hooks/queries/useMatch";
import { insertNumberSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

import Loading from "./loading";

export default function Page({
  params: { matchId },
}: {
  params: { matchId: string };
}) {
  const { match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return notFound();
  }

  return (
    <>
      <Card>
        {match.map_pick ? (
          <Image
            src={`/img/maps/${match.map_pick.slice(3).toLowerCase()}.webp`}
            alt="Map"
            className="w-[1212px] h-[120px] rounded-t-xl object-cover"
            width={1212}
            height={120}
          />
        ) : (
          <Skeleton className="w-[1212px] h-[120px] rounded-none rounded-t-xl" />
        )}

        <div className="flex justify-between p-6">
          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <Avatar className="size-16">
              <AvatarImage
                src={match.teams[0].avatar || undefined}
                alt="First team's avatar"
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                {match.teams[0].name}
              </span>

              <span
                className={cn("font-bold text-3xl", {
                  "text-green-500": match.teams[0].team_win === true,
                  "text-red-500": match.teams[0].team_win === false,
                })}
              >
                {match.teams[0].final_score}
              </span>
            </div>
          </div>

          <div className="w-1/3 flex flex-col items-center text-center justify-center space-y-4">
            <span className="text-2xl">
              {format(match.started_at!, "HH:mm dd/hh/yyyy")}
            </span>
            <div className="flex space-x-2 items-center rounded-4 overflow-hidden">
              <Skeleton className="w-16 h-8 rounded" />

              <span>{match.location_pick}</span>
            </div>
            <span className="text-xl">
              {match.finished_at && match.started_at
                ? formatDistanceStrict(match.finished_at, match.started_at)
                : null}
            </span>
          </div>

          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <div className="flex flex-col items-end overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                {match.teams[1].name}
              </span>

              <span
                className={cn("font-bold text-3xl", {
                  "text-green-500": match.teams[1].team_win === true,
                  "text-red-500": match.teams[1].team_win === false,
                })}
              >
                {match.teams[1].final_score}
              </span>
            </div>
            <Avatar className="size-16">
              <AvatarImage
                src={match.teams[1].avatar ?? undefined}
                alt="Second team's avatar"
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
          </div>
        </div>
      </Card>

      <div className="flex space-x-12">
        <div className="flex flex-col space-y-6 w-full">
          <h5 className="text-3xl font-bold">Stats</h5>
          {match.teams.flatMap((team) => {
            team.team_players.sort((a, b) => {
              const kdA = a.player_stats
                ? Number(a.player_stats["Kills"]) -
                  Number(a.player_stats["Deaths"])
                : 0;
              const kdB = b.player_stats
                ? Number(b.player_stats["Kills"]) -
                  Number(b.player_stats["Deaths"])
                : 0;

              return kdB - kdA;
            });

            return (
              <Card key={team.id}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[52.5%] flex items-center space-x-4">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={team.avatar ?? undefined}
                            alt="First team's avatar"
                          />
                          <AvatarFallback></AvatarFallback>
                        </Avatar>

                        <span>{team.name}</span>
                      </TableHead>
                      <TableHead className="w-[10%]">K - D</TableHead>
                      <TableHead className="w-[7.5%]">+/-</TableHead>
                      <TableHead className="w-[10%]">ADR</TableHead>
                      <TableHead className="w-[10%]">KAST</TableHead>
                      <TableHead className="w-[10%]">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team.team_players.map((player) => {
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="w-[52.5%] space-x-6 flex items-center">
                            {player.player_id_nullable ? (
                              <Link href={`/player/${player.nickname}`}>
                                {player.nickname}
                              </Link>
                            ) : (
                              <span>{player.nickname}</span>
                            )}
                          </TableCell>

                          <TableCell className="w-[10%]">
                            {player.player_stats ? (
                              `${Number(player.player_stats["Kills"])} - ${Number(player.player_stats["Deaths"])}`
                            ) : (
                              <Skeleton className="h-5 w-10" />
                            )}
                          </TableCell>

                          <TableCell
                            className={cn("w-[7.5%]", {
                              "text-green-500":
                                player.player_stats &&
                                Number(player.player_stats["Kills"]) >
                                  Number(player.player_stats["Deaths"]),
                              "text-red-500":
                                player.player_stats &&
                                Number(player.player_stats["Kills"]) <
                                  Number(player.player_stats["Deaths"]),
                            })}
                          >
                            {player.player_stats ? (
                              insertNumberSign(
                                Number(player.player_stats["Kills"]) -
                                  Number(player.player_stats["Deaths"]),
                              )
                            ) : (
                              <Skeleton className="h-5 w-6" />
                            )}
                          </TableCell>

                          <TableCell className="w-[10%]">
                            {player.player_stats ? (
                              Number(player.player_stats["ADR"]).toFixed(1)
                            ) : (
                              <Skeleton className="h-5 w-8" />
                            )}
                          </TableCell>

                          <TableCell className="w-[10%]">
                            <Skeleton className="h-5 w-8" />
                          </TableCell>

                          <TableCell className="w-[10%]">
                            <Skeleton className="h-5 w-8" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
