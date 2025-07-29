"use client";

import { range } from "lodash";

import { PlayerRow } from "@/components/leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEloRankings } from "@/hooks/useEloRankings";

function EloRankingsRows() {
  const { players, isLoading } = useEloRankings();

  if (isLoading) {
    return range(10).map((index) => (
      <TableRow key={index}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-2.5 w-3.75 rounded-xs" />
            <Skeleton className="h-4 w-24" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="size-6 rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-14" />
        </TableCell>
      </TableRow>
    ));
  }

  if (!players) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center">
          No players found 😔
        </TableCell>
      </TableRow>
    );
  }

  return players.map((player, index) => (
    <PlayerRow key={player.id} player={player} index={index} />
  ));
}

export function EloRankings() {
  return (
    <Card className="h-min w-full">
      <CardHeader>
        <CardTitle>Elo Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Elo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <EloRankingsRows />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
