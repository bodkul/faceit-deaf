import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import PlayerList from "@/app/components/playerList";
import { PlayerWithEloHistory } from "@/types/database";

const columns = [
  { key: "index", label: "#" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

const Leaderboard = ({ players }: { players: PlayerWithEloHistory[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {columns.map(({ key, label }) => (
          <TableHead key={key} className="w-[100px]">
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      <PlayerList players={players} columnsLength={columns.length} />
    </TableBody>
  </Table>
);

export default Leaderboard;
