"use client";

import { useCallback, useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchHubStats } from "@/lib/faceit/api";

interface PlayerStats {
  MVPs: string;
  "Average Assists": string;
  "Total Rounds with extended stats": string;
  "Total Headshots %": string;
  "Average Triple Kills": string;
  "Total Enemies Flashed": string;
  "Total Entry Wins": string;
  ADR: string;
  "Average K/D Ratio": string;
  "K/R Ratio": string;
  "Flashes per Round": string;
  "Total 1v2 Count": string;
  "Total Sniper Kills": string;
  "Enemies Flashed per Round": string;
  "Average Penta Kills": string;
  "1v2 Win Rate": string;
  "Total 1v1 Count": string;
  "Headshots per Match": string;
  "Average Headshots %": string;
  Matches: number;
  "Total Flash Count": string;
  "Sniper Kill Rate": string;
  "Quadro Kills": string;
  Rounds: string;
  "Average K/R Ratio": string;
  "Total Damage": string;
  Headshots: string;
  "Entry Rate": string;
  "Triple Kills": string;
  "Total 1v2 Wins": string;
  "Utility Damage per Round": string;
  "Total Flash Successes": string;
  "Utility Success Rate": string;
  "Total Kills with extended stats": string;
  "Penta Kills": string;
  "Average MVPs": string;
  "Utility Usage per Round": string;
  "Entry Success Rate": string;
  "Flash Success Rate": string;
  "Total Matches": string;
  "Utility Damage Success Rate": string;
  "Average Kills": string;
  Assists: string;
  "Total Utility Count": string;
  "Average Deaths": string;
  "Total Utility Damage": string;
  Wins: string;
  "Total Entry Count": string;
  "Win Rate %": string;
  Deaths: string;
  "K/D Ratio": string;
  "Sniper Kill Rate per Round": string;
  "Average Quadro Kills": string;
  Kills: string;
  "1v1 Win Rate": string;
  "Total Utility Successes": string;
}

type Player = {
  player_id: string;
  nickname: string;
  stats: PlayerStats;
};

function usePlayerStats(hubId: string) {
  const [data, setData] = useState<Player[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    const { players } = await fetchHubStats(hubId);

    setData(
      players.sort(function (a, b) {
        return b.stats["Matches"] - a.stats["Matches"];
      }),
    );
    setLoading(false);
  }, [hubId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
  };
}

const renderLoadingRows = (count: number) => {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
    </TableRow>
  ));
};

export default function Page() {
  const { data, isLoading } = usePlayerStats(
    "61ee3fd2-8269-45b9-af74-e92b5caacaa5",
  );

  return (
    <div className="flex rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rating</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Matches</TableHead>
            <TableHead>K/D</TableHead>
            <TableHead>ADR</TableHead>
            <TableHead>HS %</TableHead>
            <TableHead>Sniper Kill Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || data == null
            ? renderLoadingRows(20)
            : data.map((player, index) => (
                <TableRow key={player.player_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{player.nickname}</div>
                  </TableCell>
                  <TableCell>{player.stats["Matches"]}</TableCell>
                  <TableCell>{player.stats["Average K/D Ratio"]}</TableCell>
                  <TableCell>{player.stats["ADR"]}</TableCell>
                  <TableCell>{player.stats["Average Headshots %"]}</TableCell>
                  <TableCell>{player.stats["Sniper Kill Rate"]}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
