import Image from "next/image";
import { TableRow, TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EloDelta from "@/app/components/eloDelta";
import { PlayerWithEloHistory } from "@/types/database";

const PlayerRow = ({
  player,
  index,
}: {
  player: PlayerWithEloHistory;
  index: number;
}) => (
  <TableRow key={player.id} className="h-[49px]">
    <TableCell>{index + 1}</TableCell>
    <TableCell>
      <Avatar className="h-8 w-8">
        <AvatarImage src={player.avatar} alt={`Avatar of ${player.nickname}`} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
    </TableCell>
    <TableCell>
      <a
        className="font-medium"
        href={player.faceit_url.replace("{lang}", "ru")}
        target="_blank"
        rel="noopener noreferrer"
      >
        {player.nickname}
      </a>
    </TableCell>
    <TableCell>
      <Image
        src={`/icons/faceit/levels/${player.skill_level}.svg`}
        className="w-6 h-6"
        width={24}
        height={24}
        alt={`Skill level ${player.skill_level}`}
      />
    </TableCell>
    <TableCell>
      {player.faceit_elo}
      <EloDelta player={player} />
    </TableCell>
  </TableRow>
);

export default PlayerRow;
