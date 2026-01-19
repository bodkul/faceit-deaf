"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { SkillLevelIcon } from "@/components/icons";
import { TableCell, TableRow } from "@/components/ui/table";
import { getCountryFlagUrl } from "@/lib/country";
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
      className="cursor-pointer"
      onClick={() => router.push(`/player/${player.nickname}`)}
    >
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {player.country ? (
            <Image
              className="h-2.5 w-3.75 rounded-xs"
              src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
              width={15}
              height={10}
              alt={`${player.country} flag`}
            />
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
