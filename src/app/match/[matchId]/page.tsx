"use client";

import { format, formatDistanceStrict } from "date-fns";
import Image from "next/image";
import Link from "next/link";

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
import useMatch from "@/hooks/useMatch";
import { calculateAverageStats } from "@/hooks/useMatches";
import { insertNumberSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

export default function Page({
  params: { matchId },
}: {
  params: { matchId: string };
}) {
  const match = useMatch(matchId);

  if (!match) return;

  const score = {
    team1: match.stats.score.find((s) => s.teamId === match.team1.faction_id),
    team2: match.stats.score.find((s) => s.teamId === match.team2.faction_id),
  };

  const stats = {
    team1: match.team1.roster
      .filter((player) =>
        match.stats.team1.some((p) => p.player_id === player.player_id),
      )
      .map((player) => ({
        id: player.player_id,
        username: player.nickname,
        stats: calculateAverageStats([
          {
            ...match.stats.team1.find((p) => p.player_id === player.player_id)!
              .player_stats,
            Rounds: match.stats.rounds.toString(),
          },
        ]),
      }))
      .sort((a, b) => b.stats.rating - a.stats.rating),
    team2: match.team2.roster
      .filter((player) =>
        match.stats.team2.some((p) => p.player_id === player.player_id),
      )
      .map((player) => ({
        id: player.player_id,
        username: player.nickname,
        stats: calculateAverageStats([
          {
            ...match.stats.team2.find((p) => p.player_id === player.player_id)!
              .player_stats,
            Rounds: match.stats.rounds.toString(),
          },
        ]),
      }))
      .sort((a, b) => b.stats.rating - a.stats.rating),
  };

  return (
    <>
      <Card>
        <Image
          src={`/img/maps/${match.map.name?.slice(3)}.webp`}
          alt="Map"
          className="w-full h-[120px] rounded-t-xl object-cover"
          width={1250}
          height={120}
        />

        <div className="flex justify-between p-6">
          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <Avatar className="w-16 h-16">
              <AvatarImage src={match.team1.avatar} alt="First team's avatar" />
              <AvatarFallback></AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                {match.team1.name}
              </span>

              <span
                className={cn("font-bold text-3xl", {
                  "!text-green-600": match.winner.team1,
                  "!text-red-600": match.winner.team2,
                })}
              >
                {score.team1?.score}
              </span>
            </div>
          </div>

          <div className="w-1/3 flex flex-col items-center text-center justify-center space-y-4">
            <span className="text-2xl">
              {match && format(match.startedAt, "HH:mm dd/hh/yyyy")}
            </span>
            <div className="flex space-x-2 items-center rounded-4 overflow-hidden">
              <Image
                src={match.server.image.sm || ""}
                alt="Server location country"
                className="w-auto h-auto rounded"
                width={60}
                height={30}
              />

              <span>{match.server.name}</span>
            </div>
            <span className="text-xl">
              {match && formatDistanceStrict(match.finishedAt, match.startedAt)}
            </span>
          </div>

          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <div className="flex flex-col items-end overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                {match.team2.name}
              </span>

              <span
                className={cn("font-bold text-3xl", {
                  "!text-green-600": match.winner.team2,
                  "!text-red-600": match.winner.team1,
                })}
              >
                {score.team2?.score}
              </span>
            </div>
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={match.team2.avatar}
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

          <Card>
            {match && stats.team1 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[52.5%] flex items-center space-x-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={match.team1.avatar}
                          alt="First team's avatar"
                        />
                        <AvatarFallback></AvatarFallback>
                      </Avatar>

                      <span>{match.team1.name}</span>
                    </TableHead>
                    <TableHead className="w-[10%]">K - D</TableHead>
                    <TableHead className="w-[7.5%]">+/-</TableHead>
                    <TableHead className="w-[10%]">ADR</TableHead>
                    <TableHead className="w-[10%]">KAST</TableHead>
                    <TableHead className="w-[10%]">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.team1.map((player) => {
                    const country = match.countries.team1.find(
                      (p) => p.id === player.id,
                    )!.country;

                    return (
                      <TableRow key={player.id}>
                        <TableCell className="w-[52.5%] space-x-6 flex items-center">
                          <Image
                            src={`https://flagcdn.com/${country.toLowerCase()}.svg`}
                            alt={country}
                            className="borderborder-[#000]"
                            width={22}
                            height={16}
                          />

                          <Link href={`/player/${player.username}`}>
                            {player.username}
                          </Link>
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.kills} - {player.stats.deaths}
                        </TableCell>

                        <TableCell
                          className={cn("w-[7.5%]", {
                            "!text-green-600":
                              player.stats.kills > player.stats.deaths,
                            "!text-red-600":
                              player.stats.kills < player.stats.deaths,
                          })}
                        >
                          {insertNumberSign(
                            player.stats.kills - player.stats.deaths,
                          )}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.adr.toFixed(1)}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.kast.toFixed(1)}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.rating.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          <Card>
            {match && stats.team1 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[52.5%] flex items-center space-x-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={match.team2.avatar}
                          alt="Second team's avatar"
                        />
                        <AvatarFallback></AvatarFallback>
                      </Avatar>

                      <span>{match.team1.name}</span>
                    </TableHead>
                    <TableHead className="w-[10%]">K - D</TableHead>
                    <TableHead className="w-[7.5%]">+/-</TableHead>
                    <TableHead className="w-[10%]">ADR</TableHead>
                    <TableHead className="w-[10%]">KAST</TableHead>
                    <TableHead className="w-[10%]">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.team2.map((player) => {
                    const country = match.countries.team2.find(
                      (p) => p.id === player.id,
                    )!.country;

                    return (
                      <TableRow key={player.id}>
                        <TableCell className="w-[52.5%] space-x-6 flex items-center">
                          <Image
                            src={`https://flagcdn.com/${country.toLowerCase()}.svg`}
                            alt={country}
                            className="borderborder-[#000]"
                            width={22}
                            height={16}
                          />

                          <Link href={`/player/${player.username}`}>
                            {player.username}
                          </Link>
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.kills} - {player.stats.deaths}
                        </TableCell>

                        <TableCell
                          className={cn("w-[7.5%]", {
                            "!text-green-600":
                              player.stats.kills > player.stats.deaths,
                            "!text-red-600":
                              player.stats.kills < player.stats.deaths,
                          })}
                        >
                          {insertNumberSign(
                            player.stats.kills - player.stats.deaths,
                          )}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.adr.toFixed(1)}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.kast.toFixed(1)}
                        </TableCell>

                        <TableCell className="w-[10%]">
                          {player.stats.rating.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
