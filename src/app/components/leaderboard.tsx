import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import PlayerList from "@/app/components/playerList";

const columns = [
  { key: "index", label: "#" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

const Leaderboard = () => (
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
      <PlayerList columnsLength={columns.length} />
    </TableBody>
  </Table>
);

export default Leaderboard;
