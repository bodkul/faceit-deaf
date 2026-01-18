import { format, getYear, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";
import type { RecentMatchType } from "@/types/match";

export function MatchHistoryTableRow({ match }: { match: RecentMatchType }) {
  const router = useRouter();

  const stats = useMemo(
    () =>
      calculateAverageStats([
        {
          Rounds: 0,
          Assists: 0,
          Kills: match.kills ?? 0,
          Deaths: match.deaths ?? 0,
          Headshots: match.headshots ?? 0,
          ADR: 0,
          "K/R Ratio": 0,
        },
      ]),
    [match],
  );

  return (
    <TableRow
      key={`1-${match.id}`}
      className="cursor-pointer whitespace-nowrap text-center"
      onClick={() => router.push(`/match/1-${match.id}`)}
    >
      <TableCell>
        {match.finished_at &&
          (() => {
            const date = parseISO(match.finished_at);
            return getYear(date) === new Date().getFullYear()
              ? format(date, "d. MMM HH:mm")
              : format(date, "d. MMM yyyy");
          })()}
      </TableCell>
      <TableCell>
        {match.win === true && (
          <Badge className="rounded-sm border-none bg-green-600/10 text-green-600 focus-visible:outline-none focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
            W
          </Badge>
        )}
        {match.win === false && (
          <Badge className="rounded-sm border-none bg-destructive/10 text-destructive focus-visible:outline-none focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5">
            L
          </Badge>
        )}
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
      <TableCell>{match.adr?.toFixed(1)}</TableCell>
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
