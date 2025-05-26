"use client";

import { PlayerRow, renderLoadingRows } from "@/components/leardboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEloRankings } from "@/hooks/useEloRankings";

export function EloRankings() {
  const { data } = useEloRankings();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Elo Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rating</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Elo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((player, index) => (
                <PlayerRow key={player.id} player={player} index={index} />
              )) ?? renderLoadingRows(10, 0)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
