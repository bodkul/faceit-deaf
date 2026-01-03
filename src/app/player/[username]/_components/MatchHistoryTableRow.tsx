import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { TableCell, TableRow } from "@/components/ui/table";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { RecentMatchType } from "@/types/match";

export function MatchHistoryTableRow({ match }: { match: RecentMatchType }) {
  const router = useRouter();

  const stats = calculateAverageStats([
    {
      Rounds: 0,
      Assists: 0,
      Kills: match.kills ?? 0,
      Deaths: match.deaths ?? 0,
      Headshots: match.headshots ?? 0,
      ADR: match.adr ?? 0,
      "K/R Ratio": match.kr_ratio ?? 0,
    },
  ]);

  return (
    <TableRow
      key={`1-${match.id}`}
      className="cursor-pointer whitespace-nowrap text-center"
      onClick={() => router.push(`/match/1-${match.id}`)}
    >
      <TableCell>
        {match.finished_at && format(match.finished_at, "dd MMM - HH:mm")}
      </TableCell>
      <TableCell
        className={cn({
          "text-red-500": match.win === false,
          "text-green-500": match.win === true,
        })}
      >
        {typeof match.win === "boolean" && match.win ? "W" : "L"}
      </TableCell>
      <TableCell>{match.round_score}</TableCell>
      <TableCell>
        {match?.kills && match?.deaths && `${match.kills} - ${match.deaths}`}
      </TableCell>
      <TableCell
        className={cn({
          "text-red-500": stats?.kd && stats.kd < 0.95,
          "text-green-500": stats?.kd && stats.kd > 1.05,
          "text-[#929a9e]": stats?.kd && stats.kd >= 0.95 && stats.kd <= 1.05,
        })}
      >
        {stats && stats.kd > 0 ? stats.kd.toFixed(2) : null}
      </TableCell>
      <TableCell>
        {stats && stats.adr > 0 ? stats.adr.toFixed(1) : null}
      </TableCell>
      <TableCell>
        {stats && stats.hsp > 0 ? `${stats.hsp.toFixed(0)} %` : null}
      </TableCell>
      <TableCell className="text-[#87a3bf] capitalize">
        {match.map?.replace("de_", "")}
      </TableCell>
      <TableCell>
        {match.elo_diff && (
          <span
            className={cn({
              "text-red-500": match.win === false,
              "text-green-500": match.win === true,
            })}
          >
            {formatNumberWithSign(match.elo_diff)}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
