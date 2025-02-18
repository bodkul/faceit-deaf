import Link from "next/link";

import { SkillLevelIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";

import { PlayerWithEloHistory } from "../types";
import { EloDelta } from "./elo-delta";

export function PlayerRow({
  player,
  index,
}: {
  player: PlayerWithEloHistory;
  index: number;
}) {
  return (
    <Link key={player.id} href={`/player/${player.nickname}`} legacyBehavior>
      <TableRow className="h-[49px] cursor-pointer">
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-4">
            <Avatar className="size-8">
              <AvatarImage
                src={player.avatar}
                alt={`Avatar of ${player.nickname}`}
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <div className="font-medium">{player.nickname}</div>
          </div>
        </TableCell>
        <TableCell>
          <SkillLevelIcon level={player.skill_level} className="size-6" />
        </TableCell>
        <TableCell>
          {player.faceit_elo}
          <EloDelta player={player} />
        </TableCell>
      </TableRow>
    </Link>
  );
}
