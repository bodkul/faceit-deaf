"use client";

import { IconClock, IconExternalLink, IconMapPin } from "@tabler/icons-react";
import { isNumber, orderBy, sumBy } from "lodash-es";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function formatDate(date: string): string {
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function MatchHeader({ match }: { match: MatchType }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* Map Background */}
      {match.map_pick && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={`/img/maps/${match.map_pick}.webp`}
            alt="Map"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background" />

          {/* Map Name Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge
              variant="secondary"
              className="gap-2 px-4 py-2 font-semibold text-lg capitalize"
            >
              <IconMapPin data-icon="inline-start" />
              {match.map_pick.replace("de_", "")}
            </Badge>
          </div>

          {/* FACEIT Button */}
          <div className="absolute top-4 right-4">
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`https://www.faceit.com/en/cs2/room/1-${match.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on FACEIT
                <IconExternalLink data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="grid grid-cols-3 items-center gap-6">
          {/* Team 1 */}
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-border">
              <AvatarImage src={match.teams[0].avatar ?? undefined} />
              <AvatarFallback>{match.teams[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-xl">
                {match.teams[0].name}
              </h3>
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

          {/* Match Info */}
          <div className="flex flex-col items-center gap-3 text-center">
            {match.started_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconClock className="size-4" />
                <span className="text-sm">{formatDate(match.started_at)}</span>
              </div>
            )}

            {match.location_pick && (
              <div className="flex items-center gap-2">
                <Image
                  src={getFlagUrl(getCountryCode(match.location_pick), "sm")}
                  alt="Server location"
                  width={24}
                  height={16}
                  className="rounded"
                />
                <span className="text-muted-foreground text-sm">
                  {match.location_pick}
                </span>
              </div>
            )}

            {match.finished_at && match.started_at && (
              <Badge variant="outline" className="gap-1">
                <IconClock className="size-3" />
                {formatDuration(match.started_at, match.finished_at)}
              </Badge>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-end gap-4">
            <div className="min-w-0 flex-1 text-right">
              <h3 className="truncate font-bold text-xl">
                {match.teams[1].name}
              </h3>
              <span
                className={cn("font-bold text-3xl", {
                  "text-green-500": match.teams[1].team_win === true,
                  "text-red-500": match.teams[1].team_win === false,
                })}
              >
                {match.teams[1].final_score}
              </span>
            </div>
            <Avatar className="size-16 ring-2 ring-border">
              <AvatarImage src={match.teams[1].avatar ?? undefined} />
              <AvatarFallback>{match.teams[1].name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
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

      <div className="flex w-full flex-col space-y-6">
        <h2 className="font-bold text-2xl">Match Statistics</h2>
        {match.teams.map((team) => (
          <TeamStatsTable key={team.id} team={team} totalScore={totalScore} />
        ))}
      </div>
    </>
  );
}
