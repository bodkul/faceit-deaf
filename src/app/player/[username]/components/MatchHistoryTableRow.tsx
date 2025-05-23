import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { TableCell, TableRow } from "@/components/ui/table";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { insertNumberSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { MatchHistoryType } from "@/types/match";

export function MatchHistoryTableRow({
  match,
}: {
  match: MatchHistoryType;
  playerId: string;
}) {
  const router = useRouter();
  const team = match.team[0];
  const player = team.team_players[0];
  const player_stats = player.player_stats;

  const stats =
    player_stats &&
    calculateAverageStats([
      {
        Rounds:
          match.round_score
            ?.split(" / ")
            .map(Number)
            .reduce((a, b) => a + b, 0)
            .toString() ?? "0",
        Assists: player_stats.assists ?? "0",
        Kills: player_stats.kills ?? "0",
        Deaths: player_stats.deaths ?? "0",
        Headshots: player_stats.headshots ?? "0",
        ADR: player_stats.adr ?? "0",
        "K/R Ratio": player_stats.kr_ratio ?? "0",
      },
    ]);

  return (
    <TableRow
      key={match.id}
      className="cursor-pointer text-center whitespace-nowrap"
      onClick={() => router.push(`/match/${match.id}`)}
    >
      <TableCell>
        {match.finished_at && format(match.finished_at, "dd MMM - HH:mm")}
      </TableCell>
      <TableCell
        className={cn({
          "text-red-500": team.team_win === false,
          "text-green-500": team.team_win === true,
        })}
      >
        {typeof team.team_win === "boolean" && team.team_win ? "W" : "L"}
      </TableCell>
      <TableCell>{match.round_score}</TableCell>
      <TableCell>
        {player_stats?.kills &&
          player_stats?.deaths &&
          `${player_stats.kills} - ${player_stats.deaths}`}
      </TableCell>
      <TableCell
        className={cn({
          "text-red-500": stats?.kd && stats.kd < 0.95,
          "text-green-500": stats?.kd && stats.kd > 1.05,
          "text-[#929a9e]": stats?.kd && stats.kd >= 0.95 && stats.kd <= 1.05,
        })}
      >
        {stats?.kd?.toFixed(2)}
      </TableCell>
      <TableCell>{stats?.adr.toFixed(1)}</TableCell>
      <TableCell>{stats && `${stats?.hsp.toFixed(0)} %`}</TableCell>
      <TableCell className="text-[#87a3bf] capitalize">
        {match.map_pick?.replace("de_", "")}
      </TableCell>
      <TableCell>
        {player.elo_after &&
          player.elo_before &&
          player.elo_after !== player.elo_before && (
            <span
              className={cn({
                "text-red-500": team.team_win === false,
                "text-green-500": team.team_win === true,
              })}
            >
              {insertNumberSign(player.elo_after - player.elo_before)}
            </span>
          )}
      </TableCell>
    </TableRow>
  );
}
