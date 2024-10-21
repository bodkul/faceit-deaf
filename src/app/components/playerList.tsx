"use client";

import usePlayers from "@/hooks/usePlayers";
import { TableRow, TableCell } from "@/components/ui/table";
import LoadingRow from "@/app/components/loadingRow";
import PlayerRow from "@/app/components/playerRow";

const PlayerList = ({ columnsLength }: { columnsLength: number }) => {
  const [players, loading] = usePlayers();

  if (loading) {
    return Array.from({ length: 20 }).map((_, index) => (
      <LoadingRow key={index} />
    ));
  }

  if (!players.length) {
    return (
      <TableRow>
        <TableCell colSpan={columnsLength} className="h-24 text-center">
          No players.
        </TableCell>
      </TableRow>
    );
  }

  return players.map((player, index) => (
    <PlayerRow key={player.id} player={player} index={index} />
  ));
};

export default PlayerList;
