import { cn } from "cn";
import { format, isThisYear } from "date-fns";
import { isNumber } from "es-toolkit";
import { gt, lt } from "es-toolkit/compat";
import { isNil } from "es-toolkit/predicate";
import { useRouter } from "next/navigation";

import type { useRecentMatches } from "@/hooks/useRecentMatches";
import { formatNumberWithSign } from "@/lib/faceit/utils";

export function MatchesTableHead() {
  return (
    <tr className="border-neutral-800/50 border-b">
      {["Date", "Map", "Score", "K - D", "K / D", "ADR", "HS%", "Elo +/-"].map(
        (h) => (
          <th
            key={h}
            className="px-4 py-2 text-center font-mono text-neutral-600 text-xs uppercase tracking-widest"
          >
            {h}
          </th>
        ),
      )}
    </tr>
  );
}

export function MatchesTableRow({
  match,
}: {
  match: NonNullable<ReturnType<typeof useRecentMatches>["data"]>[number];
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/match/1-${match.id}`)}
      className={cn(
        "group cursor-pointer border-neutral-800/50 border-b transition-colors last:border-b-0 hover:bg-neutral-800/30",
        match.win === true
          ? "border-l-2 border-l-emerald-500/40"
          : match.win === false
            ? "border-l-2 border-l-red-500/40"
            : "border-l-2 border-l-transparent",
      )}
    >
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-neutral-500 text-xs">
        {match.finished_at &&
          format(
            match.finished_at,
            isThisYear(match.finished_at) ? "d. MMM HH:mm" : "d. MMM yyyy",
          )}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-[#87a3bf] text-xs capitalize">
        {match.map?.replace("de_", "")}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center">
        <span
          className={cn(
            "rounded px-2 py-0.5 font-bold font-mono text-xs",
            match.win === true
              ? "bg-emerald-500/10 text-emerald-400"
              : match.win === false
                ? "bg-red-500/10 text-red-400"
                : "bg-neutral-800 text-neutral-400",
          )}
        >
          {match.round_score}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-neutral-300 text-sm">
        {!isNil(match.kills) && !isNil(match.deaths)
          ? `${match.kills} - ${match.deaths}`
          : "—"}
      </td>
      <td
        className={cn(
          "whitespace-nowrap px-4 py-2.5 text-center font-mono text-sm",
          lt(match.kd_ratio, 0.95)
            ? "text-red-400"
            : gt(match.kd_ratio, 1.05)
              ? "text-emerald-400"
              : "text-neutral-500",
        )}
      >
        {match.kd_ratio?.toFixed(2) ?? "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-neutral-400 text-sm">
        {match.adr?.toFixed(1) ?? "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-neutral-400 text-sm">
        {isNumber(match.headshots_percent) && gt(match.headshots_percent, 0)
          ? `${match.headshots_percent}%`
          : "—"}
      </td>
      <td className="whitespace-nowrap px-4 py-2.5 text-center font-mono text-sm">
        {match.elo_diff !== null ? (
          <span
            className={cn({
              "text-emerald-400": match.elo_diff > 0,
              "text-red-400": match.elo_diff < 0,
              "text-neutral-400": match.elo_diff === 0,
            })}
          >
            {formatNumberWithSign(match.elo_diff)}
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}
