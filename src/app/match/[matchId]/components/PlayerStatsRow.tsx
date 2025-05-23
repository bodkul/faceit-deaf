import Link from "next/link";

import { SkillLevelIcon } from "@/components/icons";
import { TableCell, TableRow } from "@/components/ui/table";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { insertNumberSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { PlayerType } from "@/types/match";

export function PlayerStatsRow({
  player,
  totalScore,
}: {
  player: PlayerType;
  totalScore: number;
}) {
  const stats = player.player_stats
    ? calculateAverageStats([
        {
          Rounds: totalScore.toString(),
          Assists: player.player_stats.assists ?? "0",
          Kills: player.player_stats.kills ?? "0",
          Deaths: player.player_stats.deaths ?? "0",
          Headshots: player.player_stats.headshots ?? "0",
          ADR: player.player_stats.adr ?? "0",
          "K/R Ratio": player.player_stats.kr_ratio ?? "0",
        },
      ])
    : null;

  const kills = player.player_stats ? Number(player.player_stats.kills) : null;
  const deaths = player.player_stats
    ? Number(player.player_stats.deaths)
    : null;
  const kdString =
    kills !== null && deaths !== null ? `${kills} - ${deaths}` : "";
  const kdDiff = kills !== null && deaths !== null ? kills - deaths : null;
  const kdDiffString = kdDiff !== null ? insertNumberSign(kdDiff) : "";

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
      <TableCell>
        {player.player_stats && Number(player.player_stats.adr).toFixed(1)}
      </TableCell>
      <TableCell>{stats && stats.kast.toFixed(1)}</TableCell>
      <TableCell>{stats && stats.rating.toFixed(2)}</TableCell>
    </TableRow>
  );
}
