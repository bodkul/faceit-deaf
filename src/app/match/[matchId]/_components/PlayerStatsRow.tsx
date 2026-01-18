import { isNumber } from "lodash-es";
import Link from "next/link";

import { SkillLevelIcon } from "@/components/icons";
import { TableCell, TableRow } from "@/components/ui/table";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { PlayerType } from "@/types/match";

export function PlayerStatsRow({
  player,
  totalScore,
}: {
  player: PlayerType;
  totalScore: number;
}) {
  const stats =
    isNumber(player.assists) &&
    isNumber(player.kills) &&
    isNumber(player.deaths) &&
    isNumber(player.headshots) &&
    isNumber(player.adr) &&
    isNumber(player.kr_ratio)
      ? calculateAverageStats([
          {
            Rounds: totalScore,
            Assists: player.assists ?? 0,
            Kills: player.kills ?? 0,
            Deaths: player.deaths ?? 0,
            Headshots: player.headshots ?? 0,
            ADR: player.adr ?? 0,
            "K/R Ratio": player.kr_ratio ?? 0,
          },
        ])
      : undefined;

  const kdString =
    player.kills !== null && player.deaths !== null
      ? `${player.kills} - ${player.deaths}`
      : "";
  const kdDiff =
    player.kills !== null && player.deaths !== null
      ? player.kills - player.deaths
      : null;
  const kdDiffString = kdDiff !== null ? formatNumberWithSign(kdDiff) : "";

  return (
    <TableRow>
      <TableCell className="flex items-center space-x-4">
        <SkillLevelIcon
          level={player.game_skill_level ?? 0}
          className="size-8"
        />
        {player.player_id_nullable ? (
          <Link href={`/player/${player.nickname}`}>{player.nickname}</Link>
        ) : (
          <span>{player.nickname}</span>
        )}
      </TableCell>
      <TableCell>{kdString}</TableCell>
      <TableCell
        className={cn({
          "text-green-500": kdDiff !== null && kdDiff > 0,
          "text-red-500": kdDiff !== null && kdDiff < 0,
        })}
      >
        {kdDiffString}
      </TableCell>
      <TableCell>{player.adr?.toFixed(1)}</TableCell>
      <TableCell>{stats?.kast.toFixed(1)}</TableCell>
      <TableCell>{stats?.rating.toFixed(2)}</TableCell>
    </TableRow>
  );
}
