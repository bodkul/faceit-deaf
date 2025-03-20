"use client";

import { format, formatDistanceStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { SkillLevelIcon } from "@/app/icons";
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
import calculateAverageStats from "@/lib/calculateAverageStats";
import { insertNumberSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

import Loading from "./loading";

const countryMap: Record<string, string> = {
  France: "FR",
  Sweden: "SE",
  Germany: "DE",
  UK: "UK",
  Netherlands: "NL",
  Kazakhstan: "KZ",
  Finland: "FI",
  Moscow: "RU",
};

function getCountryCode(country: string) {
  return countryMap[country];
}

function getFlagUrl(country: string, size: "sm" | "lg"): string {
  const sizeMap = {
    sm: { width: 110, height: 55 },
    lg: { width: 428, height: 212 },
  };

  return `https://distribution.faceit-cdn.net/images/flags/v1/${country.toLowerCase()}.jpg?width=${sizeMap[size].width}&height=${sizeMap[size].height}`;
}

export default function Page(props: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(props.params);

  const { match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return notFound();
  }

  const totalScore = match.teams.reduce(
    (sum, team) => sum + (team.final_score ?? 0),
    0,
  );

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
              <Image
                src={getFlagUrl(
                  getCountryCode(match.location_pick ?? ""),
                  "sm",
                )}
                alt="Server location country"
                className="size-auto rounded"
                width={60}
                height={30}
              />

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
                      const stats = player.player_stats
                        ? calculateAverageStats([
                            {
                              Rounds: totalScore.toString(),
                              Assists: player.player_stats.Assists,
                              Kills: player.player_stats.Kills,
                              Deaths: player.player_stats.Deaths,
                              Headshots: player.player_stats.Headshots,
                              ADR: player.player_stats.ADR,
                              "K/R Ratio": player.player_stats["K/R Ratio"],
                            },
                          ])
                        : null;

                      return (
                        <TableRow key={player.id}>
                          <TableCell className="w-[52.5%] space-x-4 flex items-center">
                            <SkillLevelIcon
                              level={player.game_skill_level ?? 0}
                              className="size-8"
                            />
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
                            {stats ? (
                              stats.kast.toFixed(1)
                            ) : (
                              <Skeleton className="h-5 w-8" />
                            )}
                          </TableCell>

                          <TableCell className="w-[10%]">
                            {stats ? (
                              stats.rating.toFixed(2)
                            ) : (
                              <Skeleton className="h-5 w-8" />
                            )}
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
