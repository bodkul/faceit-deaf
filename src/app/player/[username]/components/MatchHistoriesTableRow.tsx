import { formatRelative } from "date-fns";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { cn } from "@/lib/utils";
import { MatchHistoryType } from "@/types/match";

export function MatchHistoriesTableRow({
  match,
}: {
  match: MatchHistoryType;
  playerId: string;
}) {
  const router = useRouter();
  const team = match.team[0];
  const player_stats = team.team_players[0].player_stats;
  const kills = Number(player_stats?.kills ?? 0);
  const deaths = Number(player_stats?.deaths ?? 0);
  const kd = player_stats ? kills / deaths : undefined;

  return (
    <TableRow
      key={match.id}
      className={cn("cursor-pointer !border-r-4 whitespace-nowrap", {
        "border-r-red-500": team.team_win === false,
        "border-r-green-500": team.team_win === true,
      })}
      onClick={() => router.push(`/match/${match.id}`)}
    >
      <TableCell>
        {match.finished_at ? (
          formatRelative(match.finished_at, new Date())
        ) : (
          <Skeleton className="h-5 w-24" />
        )}
      </TableCell>
      <TableCell className="text-[#87a3bf] capitalize">
        {match.map_pick?.replace("de_", "") ?? (
          <Skeleton className="h-5 w-12" />
        )}
      </TableCell>
      <TableCell>
        {match.round_score ?? <Skeleton className="h-5 w-10" />}
      </TableCell>
      <TableCell>
        {player_stats?.kills && player_stats?.deaths ? (
          `${player_stats.kills} - ${player_stats.deaths}`
        ) : (
          <Skeleton className="h-5 w-12" />
        )}
      </TableCell>
      <TableCell
        className={cn("font-semibold", {
          "text-red-500": kd && kd < 0.95,
          "text-green-500": kd && kd > 1.05,
          "text-[#929a9e]": kd && kd >= 0.95 && kd <= 1.05,
        })}
      >
        {kd?.toFixed(2) ?? <Skeleton className="h-5 w-8" />}
      </TableCell>
      <TableCell>
        {player_stats ? (
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
          ]).rating.toFixed(2)
        ) : (
          <Skeleton className="h-5 w-8" />
        )}
      </TableCell>
    </TableRow>
  );
}
