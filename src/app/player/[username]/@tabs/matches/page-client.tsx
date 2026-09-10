"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHistory,
} from "@tabler/icons-react";
import { cn } from "cn";
import { format, isThisYear } from "date-fns";
import { isBoolean, isNil, isNumber, range } from "es-toolkit";
import { gt, lt } from "es-toolkit/compat";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { formatNumberWithSign } from "@/lib/faceit/utils";

const TABLE_COLUMNS = [
  { key: "date", label: "Date", skeletonWidth: "6rem" },
  { key: "map", label: "Map", skeletonWidth: "3rem" },
  { key: "score", label: "Score", skeletonWidth: "2.5rem" },
  { key: "kd", label: "K - D", skeletonWidth: "3rem" },
  { key: "kdr", label: "K / D", skeletonWidth: "2rem" },
  { key: "adr", label: "ADR", skeletonWidth: "2rem" },
  { key: "hs", label: "HS%", skeletonWidth: "2rem" },
  { key: "elo", label: "Elo +/-", skeletonWidth: "2rem" },
] as const;

function MatchHistoryWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      <CardHeader>
        <CardTitle>Match History</CardTitle>
        <CardDescription>
          Complete list of all played matches with detailed statistics
        </CardDescription>
      </CardHeader>

      {children}

      {footer && <CardFooter className="justify-between">{footer}</CardFooter>}
    </Card>
  );
}

function MatchHistoryTable({ children }: { children: React.ReactNode }) {
  return (
    <Table className="w-full overflow-x-auto border-t font-mono">
      <TableHeader>
        <TableRow className="text-xs uppercase tracking-wide">
          {TABLE_COLUMNS.map(({ key, label }) => (
            <TableHead key={key} className="text-center text-neutral-600">
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <tbody data-slot="table-body">{children}</tbody>
    </Table>
  );
}

export function MatchHistorySkeleton() {
  return (
    <MatchHistoryWrapper>
      <MatchHistoryTable>
        {range(20).map((index) => (
          <TableRow key={index} className="h-12">
            {TABLE_COLUMNS.map(({ key, skeletonWidth }) => (
              <TableCell key={key}>
                <Skeleton
                  className="mx-auto h-5"
                  style={{ width: skeletonWidth }}
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </MatchHistoryTable>
    </MatchHistoryWrapper>
  );
}

export default function MatchHistoryPage({ playerId }: { playerId: string }) {
  const router = useRouter();
  const {
    data: matches,
    isLoading,
    pageIndex,
    totalPages,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  } = useMatchHistory(playerId);

  if (isLoading) return <MatchHistorySkeleton />;

  if (!matches?.length) {
    return (
      <MatchHistoryWrapper>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconHistory />
              </EmptyMedia>
              <EmptyTitle>No matches yet</EmptyTitle>
              <EmptyDescription>
                Match history will appear here once played.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </MatchHistoryWrapper>
    );
  }

  const footer = (
    <>
      <span className="font-mono text-neutral-600 text-xs">
        Page {pageIndex} of {totalPages}
      </span>
      <PaginationContent className="gap-1">
        {[
          {
            icon: <IconChevronsLeft size={14} />,
            action: firstPage,
            label: "First",
          },
          {
            icon: <IconChevronLeft size={14} />,
            action: previousPage,
            label: "Prev",
          },
          {
            icon: <IconChevronRight size={14} />,
            action: nextPage,
            label: "Next",
          },
          {
            icon: <IconChevronsRight size={14} />,
            action: lastPage,
            label: "Last",
          },
        ].map(({ icon, action, label }) => (
          <PaginationItem key={label}>
            <Button
              variant="dark"
              size="icon-sm"
              onClick={() => action?.()}
              disabled={!action}
              className="disabled:opacity-30"
            >
              <span className="sr-only">{label}</span>
              {icon}
            </Button>
          </PaginationItem>
        ))}
      </PaginationContent>
    </>
  );

  return (
    <MatchHistoryWrapper footer={footer}>
      <MatchHistoryTable>
        {matches.map((match) => {
          const matchUrl = `/match/1-${match.id}`;

          return (
            <TableRow
              key={match.id}
              tabIndex={0}
              role="link"
              aria-label={`View match on ${match.map?.replace("de_", "")}`}
              onClick={() => router.push(matchUrl)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(matchUrl);
                }
              }}
              className={cn(
                "h-12 cursor-pointer border-l-2 [&>td]:text-center",
                {
                  "border-l-emerald-500/40": match.win === true,
                  "border-l-red-500/40": match.win === false,
                  "border-l-transparent": !isBoolean(match.win),
                },
              )}
            >
              <TableCell className="text-neutral-500 text-xs">
                {match.finished_at &&
                  format(
                    match.finished_at,
                    isThisYear(match.finished_at)
                      ? "d. MMM HH:mm"
                      : "d. MMM yyyy",
                  )}
              </TableCell>
              <TableCell className="text-[#87a3bf] text-xs capitalize">
                {match.map?.replace("de_", "")}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={cn("rounded px-2 py-0.5 font-bold text-xs", {
                    "bg-emerald-500/10 text-emerald-400": match.win === true,
                    "bg-red-500/10 text-red-400": match.win === false,
                    "bg-neutral-800 text-neutral-400": !isBoolean(match.win),
                  })}
                >
                  {match.round_score}
                </span>
              </TableCell>
              <TableCell className="text-neutral-300">
                {!isNil(match.kills) && !isNil(match.deaths)
                  ? `${match.kills} - ${match.deaths}`
                  : "—"}
              </TableCell>
              <TableCell
                className={cn(
                  "font-mono",
                  lt(match.kd_ratio, 0.95)
                    ? "text-red-400"
                    : gt(match.kd_ratio, 1.05)
                      ? "text-emerald-400"
                      : "text-neutral-500",
                )}
              >
                {match.kd_ratio?.toFixed(2) ?? "—"}
              </TableCell>
              <TableCell className="text-neutral-400">
                {match.adr?.toFixed(1) ?? "—"}
              </TableCell>
              <TableCell className="text-neutral-400">
                {isNumber(match.headshots_percent) &&
                gt(match.headshots_percent, 0)
                  ? `${match.headshots_percent}%`
                  : "—"}
              </TableCell>
              <TableCell className="font-mono">
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
              </TableCell>
            </TableRow>
          );
        })}
      </MatchHistoryTable>
    </MatchHistoryWrapper>
  );
}
