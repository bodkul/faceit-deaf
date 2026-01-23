"use client";

import { format, formatDistanceStrict } from "date-fns";
import { isNumber, orderBy, sumBy } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";

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
import { useMatch } from "@/hooks/useMatch";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { getCountryCode, getFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { MatchType, PlayerType, TeamType } from "@/types/match";

import Loading from "./loading";

function MatchHeader({ match }: { match: MatchType }) {
  return (
    <Card className="gap-0 py-0">
      {match.map_pick && (
        <Image
          src={`/img/maps/${match.map_pick}.webp`}
          alt="Map"
          className="h-30 w-303 rounded-t-xl object-cover"
          width={1212}
          height={120}
        />
      )}

      <div className="flex justify-between p-6">
        <div className="flex w-1/3 items-center justify-center space-x-5 overflow-hidden">
          <Avatar className="size-16">
            <AvatarImage
              src={match.teams[0].avatar ?? undefined}
              alt="First team's avatar"
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
                src={getFlagUrl(getCountryCode(match.location_pick), "sm")}
                alt="Server location country"
                className="rounded"
                width={60}
                height={30}
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
              src={match.teams[1].avatar ?? undefined}
              alt="Second team's avatar"
            />
            <AvatarFallback />
          </Avatar>
        </div>
      </div>
    </Card>
  );
}

function TeamStatsTable({
  team,
  totalScore,
}: {
  team: TeamType;
  totalScore: number;
}) {
  const sortedPlayers = useMemo(
    () => orderBy(team.team_players, (player) => player.kills || 0, "desc"),
    [team.team_players],
  );

  return (
    <Card key={team.id} className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex w-5/10 items-center space-x-4">
              <Avatar className="size-8">
                <AvatarImage src={team.avatar ?? undefined} alt="Team avatar" />
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
          {sortedPlayers.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={player}
              totalScore={totalScore}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function PlayerStatsRow({
  player,
  totalScore,
}: {
  player: PlayerType;
  totalScore: number;
}) {
  const stats =
    isNumber(player.assists) &&
    isNumber(player.kills) &&
    isNumber(player.deaths) &&
    isNumber(player.headshots) &&
    isNumber(player.adr) &&
    isNumber(player.kr_ratio)
      ? calculateAverageStats([
          {
            Rounds: totalScore,
            Assists: player.assists ?? 0,
            Kills: player.kills ?? 0,
            Deaths: player.deaths ?? 0,
            Headshots: player.headshots ?? 0,
            ADR: player.adr ?? 0,
            "K/R Ratio": player.kr_ratio ?? 0,
          },
        ])
      : undefined;

  const kdString =
    player.kills !== null && player.deaths !== null
      ? `${player.kills} - ${player.deaths}`
      : "";
  const kdDiff =
    player.kills !== null && player.deaths !== null
      ? player.kills - player.deaths
      : null;
  const kdDiffString = kdDiff !== null ? formatNumberWithSign(kdDiff) : "";

  return (
    <TableRow>
      <TableCell className="flex items-center space-x-4">
        <SkillLevelIcon
          level={player.game_skill_level ?? 0}
          className="size-8"
        />
        {player.player_id_nullable ? (
          <Link href={`/player/${player.nickname}`}>{player.nickname}</Link>
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
      <TableCell>{player.adr?.toFixed(1)}</TableCell>
      <TableCell>{stats?.kast.toFixed(1)}</TableCell>
      <TableCell>{stats?.rating.toFixed(2)}</TableCell>
    </TableRow>
  );
}

export default function MatchPage(props: PageProps<"/match/[matchId]">) {
  const { matchId } = use(props.params);
  const { data: match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

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
      <MatchHeader match={match} />
      <div className="flex space-x-12">
        <div className="flex w-full flex-col space-y-6">
          <h5 className="font-bold text-3xl">Stats</h5>
          {match.teams.map((team) => (
            <TeamStatsTable key={team.id} team={team} totalScore={totalScore} />
          ))}
        </div>
      </div>
    </>
  );
}
