import { TableRow, TableCell } from "@/components/ui/table";
import PlayerRow from "@/app/components/playerRow";
import { PlayerWithEloHistory } from "@/types/database";

const PlayerList = ({
  players,
  columnsLength,
}: {
  players: PlayerWithEloHistory[];
  columnsLength: number;
}) => {
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
