"use client";

import { useRouter } from "next/navigation";
import Flag from "react-world-flags";

import { EloDelta } from "./elo-delta";
import { SkillLevelIcon } from "@/components/icons";
import { TableCell, TableRow } from "@/components/ui/table";
import type { PlayerWithPagination } from "@/types/player";

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
      className="cursor-pointer"
      onClick={() => router.push(`/player/${player.nickname}`)}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {player.country ? (
            <Flag code={player.country} className="h-2.5 w-3.75 rounded-xs" />
          ) : (
            <div className="h-2.5 w-3.75 rounded-xs bg-neutral-700" />
          )}
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
  );
}
