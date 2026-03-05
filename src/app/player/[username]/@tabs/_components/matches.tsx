import { format, isThisYear } from "date-fns";
import { isNumber } from "es-toolkit";
import { gt, inRange, lt } from "es-toolkit/compat";
import { isNil } from "es-toolkit/predicate";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { useRecentMatches } from "@/hooks/useRecentMatches";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

export function MatchesTableHead() {
  return (
    <TableRow className="[&>th]:text-center">
      <TableHead>Date</TableHead>
      <TableHead>Map</TableHead>
      <TableHead>Score</TableHead>
      <TableHead>K - D</TableHead>
      <TableHead>K / D</TableHead>
      <TableHead>ADR</TableHead>
      <TableHead>HS%</TableHead>
      <TableHead>Elo +/-</TableHead>
    </TableRow>
  );
}

export function MatchesTableRow({
  match,
}: {
  match: NonNullable<ReturnType<typeof useRecentMatches>["data"]>[number];
}) {
  const router = useRouter();

  return (
    <TableRow
      key={`1-${match.id}`}
      className="cursor-pointer whitespace-nowrap text-center"
      onClick={() => router.push(`/match/1-${match.id}`)}
    >
      <TableCell>
        {match.finished_at &&
          (() =>
            format(
              match.finished_at,
              isThisYear(match.finished_at) ? "d. MMM HH:mm" : "d. MMM yyyy",
            ))()}
      </TableCell>
      <TableCell className="text-[#87a3bf] capitalize">
        {match.map?.replace("de_", "")}
      </TableCell>
      <TableCell>
        <Badge
          className={cn("rounded-sm border-none focus-visible:outline-none", {
            "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5":
              match.win === true,
            "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5":
              match.win === false,
          })}
        >
          {match.round_score}
        </Badge>
      </TableCell>
      <TableCell>
        {!isNil(match.kills) && !isNil(match.deaths)
          ? `${match.kills} - ${match.deaths}`
          : null}
      </TableCell>
      <TableCell
        className={cn({
          "text-red-500": lt(match.kd_ratio, 0.95),
          "text-green-500": gt(match.kd_ratio, 1.05),
          "text-[#929a9e]":
            isNumber(match.kd_ratio) && inRange(match.kd_ratio, 0.95, 1.05),
        })}
      >
        {match.kd_ratio?.toFixed(2) ?? null}
      </TableCell>
      <TableCell>{match.adr?.toFixed(1)}</TableCell>
      <TableCell>
        {isNumber(match.headshots_percent) && gt(match.headshots_percent, 0)
          ? `${match.headshots_percent} %`
          : null}
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
