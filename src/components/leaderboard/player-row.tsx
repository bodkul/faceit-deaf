"use client";

import { useRouter } from "next/navigation";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableCell, TableRow } from "@/components/ui/table";
import type { PlayerWithPagination } from "@/types/player";

import { EloDelta } from "./elo-delta";

export function PlayerRow({
  player,
  index,
}: {
  player: PlayerWithPagination;
  index: number;
}) {
  const router = useRouter();

  return (
    <TableRow
      key={player.id}
      className="h-[49px] cursor-pointer"
      onClick={() => router.push(`/player/${player.nickname}`)}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-4">
          <Avatar className="size-8">
            <AvatarImage
              src={player.avatar!}
              alt={`Avatar of ${player.nickname}`}
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="font-medium">{player.nickname}</div>
        </div>
      </TableCell>
      <TableCell>
        <SkillLevelIcon level={player.skill_level!} className="size-6" />
      </TableCell>
      <TableCell>
        {player.faceit_elo}
        <EloDelta player={player} />
      </TableCell>
    </TableRow>
  );
}
