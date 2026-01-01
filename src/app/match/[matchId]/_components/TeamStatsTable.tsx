import { orderBy } from "lodash-es";
import { useMemo } from "react";

import { PlayerStatsRow } from "./PlayerStatsRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamType } from "@/types/match";

export function TeamStatsTable({
  team,
  totalScore,
}: {
  team: TeamType;
  totalScore: number;
}) {
  const sortedPlayers = useMemo(
    () => orderBy(team.team_players, (p) => p.player_stats?.kills || 0, "desc"),
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
