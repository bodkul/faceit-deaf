"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceStrict } from "date-fns";
import { orderBy, sumBy, toInteger } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { supabaseClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

import Loading from "./loading";

export const countryMap: Record<string, string> = {
  France: "FR",
  Sweden: "SE",
  Germany: "DE",
  UK: "UK",
  Netherlands: "NL",
  Kazakhstan: "KZ",
  Finland: "FI",
  Moscow: "RU",
};

export function getCountryCode(country: string) {
  return countryMap[country];
}

export function getFlagUrl(country: string, size: "sm" | "lg"): string {
  const sizeMap = {
    sm: { width: 110, height: 55 },
    lg: { width: 428, height: 212 },
  };

  return `https://distribution.faceit-cdn.net/images/flags/v1/${country.toLowerCase()}.jpg?width=${sizeMap[size].width}&height=${sizeMap[size].height}`;
}

export default function Page({ params }: PageProps<"/match/[matchId]">) {
  const { matchId } = use(params);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("matches")
        .select(
          "map_pick, location_pick, started_at, finished_at, teams:match_teams(id, avatar, name, team_win, final_score, team_players:match_team_players(id, player_id_nullable, nickname, game_skill_level, player_stats:player_stats_normalized(kills, deaths, assists, headshots, adr, kr_ratio)))",
        )
        .eq("id", matchId.replace(/^1-/, ""))
        .order("faction", { referencedTable: "teams", ascending: true })
        .limit(1)
        .single();
      return data;
    },
  });

  if (!matchId.startsWith("1-")) {
    return notFound();
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return notFound();
  }

  const totalScore = sumBy(match.teams, (team) => team.final_score ?? 0);

  return (
    <>
      <Card className="py-0">
        {match.map_pick && (
          <Image
            alt="Map"
            className="h-30 w-303 rounded-t-xl object-cover"
            height={120}
            src={`/img/maps/${match.map_pick}.webp`}
            width={1212}
          />
        )}

        <div className="flex justify-between p-6">
          <div className="flex w-1/3 items-center justify-center space-x-5 overflow-hidden">
            <Avatar className="size-16">
              <AvatarImage
                alt="First team's avatar"
                src={match.teams[0].avatar ?? undefined}
              />
              <AvatarFallback />
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
          <div className="flex w-1/3 flex-col items-center justify-center space-y-4 text-center">
            {match.started_at && (
              <span className="text-2xl">
                {format(match.started_at, "HH:mm dd/MM/yyyy")}
              </span>
            )}
            {match.location_pick && (
              <div className="flex items-center space-x-2 overflow-hidden rounded-4">
                <Image
                  alt="Server location country"
                  className="rounded"
                  height={30}
                  src={getFlagUrl(getCountryCode(match.location_pick), "sm")}
                  width={60}
                />
                <span>{match.location_pick}</span>
              </div>
            )}
            <span className="text-xl">
              {match.finished_at && match.started_at
                ? formatDistanceStrict(match.finished_at, match.started_at)
                : null}
            </span>
          </div>
          <div className="flex w-1/3 items-center justify-center space-x-5 overflow-hidden">
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
                alt="Second team's avatar"
                src={match.teams[1].avatar ?? undefined}
              />
              <AvatarFallback />
            </Avatar>
          </div>
        </div>
      </Card>
      <div className="flex space-x-12">
        <div className="flex w-full flex-col space-y-6">
          <h5 className="font-bold text-3xl">Stats</h5>
          {match.teams.map((team) => {
            const sortedPlayers = orderBy(
              team.team_players,
              (p) => p.player_stats?.kills || 0,
              "desc",
            );

            return (
              <Card className="py-0" key={team.id}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="flex w-5/10 items-center space-x-4">
                        <Avatar className="size-8">
                          <AvatarImage
                            alt="Team avatar"
                            src={team.avatar ?? undefined}
                          />
                          <AvatarFallback />
                        </Avatar>
                        <span>{team.name}</span>
                      </TableHead>
                      <TableHead className="w-1/10">K - D</TableHead>
                      <TableHead className="w-1/10">+/-</TableHead>
                      <TableHead className="w-1/10">ADR</TableHead>
                      <TableHead className="w-1/10">KAST</TableHead>
                      <TableHead className="w-1/10">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player) => {
                      const stats = player.player_stats
                        ? calculateAverageStats([
                            {
                              Rounds: totalScore,
                              Assists: player.player_stats.assists ?? 0,
                              Kills: player.player_stats.kills ?? 0,
                              Deaths: player.player_stats.deaths ?? 0,
                              Headshots: player.player_stats.headshots ?? 0,
                              ADR: player.player_stats.adr ?? 0,
                              "K/R Ratio": player.player_stats.kr_ratio ?? 0,
                            },
                          ])
                        : null;

                      const kills = player.player_stats
                        ? toInteger(player.player_stats.kills)
                        : null;
                      const deaths = player.player_stats
                        ? toInteger(player.player_stats.deaths)
                        : null;
                      const kdString =
                        kills !== null && deaths !== null
                          ? `${kills} - ${deaths}`
                          : "";
                      const kdDiff =
                        kills !== null && deaths !== null
                          ? kills - deaths
                          : null;
                      const kdDiffString =
                        kdDiff !== null ? formatNumberWithSign(kdDiff) : "";

                      return (
                        <TableRow key={player.id}>
                          <TableCell className="flex items-center space-x-4">
                            <SkillLevelIcon
                              className="size-8"
                              level={player.game_skill_level ?? 0}
                            />
                            {player.player_id_nullable ? (
                              <Link href={`/player/${player.nickname}`}>
                                {player.nickname}
                              </Link>
                            ) : (
                              <span>{player.nickname}</span>
                            )}
                          </TableCell>
                          <TableCell>{kdString}</TableCell>
                          <TableCell
                            className={cn({
                              "text-green-500": kdDiff !== null && kdDiff > 0,
                              "text-red-500": kdDiff !== null && kdDiff < 0,
                            })}
                          >
                            {kdDiffString}
                          </TableCell>
                          <TableCell>
                            {player.player_stats &&
                              toInteger(player.player_stats.adr).toFixed(1)}
                          </TableCell>
                          <TableCell>{stats?.kast.toFixed(1)}</TableCell>
                          <TableCell>{stats?.rating.toFixed(2)}</TableCell>
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
