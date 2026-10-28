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
import { isNil, isNumber, range } from "es-toolkit";
import Link from "next/link";

import { SectionHeader } from "@/components/section-header";
import {
  diffTone,
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchHistory } from "@/features/player/hooks/use-match-history";
import { formatNumberWithSign } from "@/lib/format";

const COLUMNS = ["Date", "Map", "Score", "K – D", "K/D", "ADR", "HS%", "ELO"];

function MatchHistorySection({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        title="Match history"
        description="Every tracked match, newest first"
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
        {children}
        {footer && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}

function MatchHistoryTable({ children }: { children: React.ReactNode }) {
  return (
    <StatsTable minWidth={680}>
      <thead className="border-b border-border">
        <tr>
          {COLUMNS.map((label, index) => (
            <StatsTh
              key={label}
              align={index < 2 ? "left" : index === 2 ? "center" : "right"}
            >
              {label}
            </StatsTh>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">{children}</tbody>
    </StatsTable>
  );
}

export function MatchHistorySkeleton() {
  return (
    <MatchHistorySection>
      <MatchHistoryTable>
        {range(12).map((index) => (
          <tr key={index}>
            {COLUMNS.map((label) => (
              <td key={label} className="h-11 px-3 first:pl-4 last:pr-4">
                <Skeleton className="h-4 w-full max-w-16" />
              </td>
            ))}
          </tr>
        ))}
      </MatchHistoryTable>
    </MatchHistorySection>
  );
}

export default function MatchHistoryPage({ playerId }: { playerId: string }) {
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
      <section className="flex flex-col gap-4">
        <SectionHeader title="Match history" />
        <Empty className="rounded-xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconHistory />
            </EmptyMedia>
            <EmptyTitle>No matches yet</EmptyTitle>
            <EmptyDescription>
              Matches show up here as soon as they are played.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </section>
    );
  }

  const pager = [
    { icon: IconChevronsLeft, action: firstPage, label: "First page" },
    { icon: IconChevronLeft, action: previousPage, label: "Previous page" },
    { icon: IconChevronRight, action: nextPage, label: "Next page" },
    { icon: IconChevronsRight, action: lastPage, label: "Last page" },
  ];

  const footer = (
    <>
      <span className="text-sm text-muted-foreground">
        Page <span className="font-mono text-foreground">{pageIndex}</span> of{" "}
        <span className="font-mono text-foreground">{totalPages}</span>
      </span>
      <div className="flex gap-1">
        {pager.map(({ icon: Icon, action, label }) => (
          <Button
            key={label}
            variant="outline"
            size="icon-sm"
            onClick={() => action?.()}
            disabled={!action}
            aria-label={label}
          >
            <Icon />
          </Button>
        ))}
      </div>
    </>
  );

  return (
    <MatchHistorySection footer={footer}>
      <MatchHistoryTable>
        {matches.map((match) => {
          const map = match.map?.replace("de_", "") ?? "—";
          return (
            <tr
              key={match.id}
              className={cn(
                "group relative transition-colors hover:bg-foreground/3",
                // Result stripe on the left edge.
                "[&>td:first-child]:border-l-2",
                match.win === true && "[&>td:first-child]:border-l-win",
                match.win === false && "[&>td:first-child]:border-l-loss",
                match.win == null && "[&>td:first-child]:border-l-transparent",
              )}
            >
              <StatsTd align="left" tone="muted" numeric={false}>
                {/* Stretched link: the whole row opens the match. */}
                <Link
                  href={`/match/1-${match.id}`}
                  className="after:absolute after:inset-0"
                  aria-label={`${match.win ? "Win" : "Loss"} on ${map}, ${match.round_score}`}
                >
                  {match.finished_at &&
                    format(
                      match.finished_at,
                      isThisYear(match.finished_at)
                        ? "d MMM, HH:mm"
                        : "d MMM yyyy",
                    )}
                </Link>
              </StatsTd>
              <StatsTd
                align="left"
                numeric={false}
                className="font-medium capitalize"
              >
                {map}
              </StatsTd>
              <StatsTd align="center">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold",
                    match.win === true && "bg-win/15 text-win",
                    match.win === false && "bg-loss/15 text-loss",
                    match.win == null && "bg-muted text-muted-foreground",
                  )}
                >
                  {match.round_score}
                </span>
              </StatsTd>
              <StatsTd tone="strong">
                {!isNil(match.kills) && !isNil(match.deaths)
                  ? `${match.kills} – ${match.deaths}`
                  : null}
              </StatsTd>
              <StatsTd tone={ratioTone(match.kd_ratio)}>
                {match.kd_ratio?.toFixed(2)}
              </StatsTd>
              <StatsTd>{match.adr?.toFixed(1)}</StatsTd>
              <StatsTd>
                {isNumber(match.headshots_percent) &&
                match.headshots_percent > 0
                  ? `${match.headshots_percent}%`
                  : null}
              </StatsTd>
              <StatsTd
                tone={diffTone(match.elo_diff)}
                className="font-semibold"
              >
                {match.elo_diff != null
                  ? formatNumberWithSign(match.elo_diff)
                  : null}
              </StatsTd>
            </tr>
          );
        })}
      </MatchHistoryTable>
    </MatchHistorySection>
  );
}
