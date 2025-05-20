import { useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamType } from "@/types/match";

import { PlayerStatsRow } from "./PlayerStatsRow";

export function TeamStatsTable({
  team,
  totalScore,
}: {
  team: TeamType;
  totalScore: number;
}) {
  const sortedPlayers = useMemo(() => {
    return [...team.team_players].sort((a, b) => {
      const kdA = a.player_stats
        ? Number(a.player_stats.kills) - Number(a.player_stats.deaths)
        : 0;
      const kdB = b.player_stats
        ? Number(b.player_stats.kills) - Number(b.player_stats.deaths)
        : 0;
      return kdB - kdA;
    });
  }, [team.team_players]);

  return (
    <Card key={team.id}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex w-5/10 items-center space-x-4">
              <Avatar className="size-8">
                <AvatarImage src={team.avatar ?? undefined} alt="Team avatar" />
                <AvatarFallback></AvatarFallback>
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
