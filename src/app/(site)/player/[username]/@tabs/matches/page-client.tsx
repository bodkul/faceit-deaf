"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconHistory,
} from "@tabler/icons-react";

import {
  MatchesTableHead,
  MatchesTableRow,
} from "@/app/(site)/player/[username]/@tabs/_components/matches";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatchHistory } from "@/hooks/useMatchHistory";

function MatchHistoryWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="border-neutral-800 border-b px-5 py-4">
        <h3 className="font-bold text-white">Match History</h3>
        <p className="text-neutral-500 text-sm">
          Complete list of all played matches with detailed statistics
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <MatchesTableHead />
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer && (
        <div className="flex items-center justify-between border-neutral-800 border-t px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

export function MatchHistorySkeleton() {
  const SKELETON_ROWS = Array.from({ length: 20 }, (_, i) => `row-${i}`);
  const SKELETON_COLS = [
    "date",
    "map",
    "score",
    "kd",
    "kdr",
    "adr",
    "hs",
    "elo",
  ];
  return (
    <MatchHistoryWrapper>
      {SKELETON_ROWS.map((rowKey) => (
        <tr
          key={rowKey}
          className="border-neutral-800/50 border-b last:border-0"
        >
          {SKELETON_COLS.map((col) => (
            <td key={col} className="px-4 py-3">
              <Skeleton className="mx-auto h-4 bg-neutral-800" />
            </td>
          ))}
        </tr>
      ))}
    </MatchHistoryWrapper>
  );
}

export default function MatchHistory({ playerId }: { playerId: string }) {
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

  if (!matches) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-white">Match History</h3>
          <p className="text-neutral-500 text-sm">
            Complete list of all played matches with detailed statistics
          </p>
        </div>
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
      </div>
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
              disabled={action === null}
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
      {matches.map((match) => (
        <MatchesTableRow key={match.id} match={match} />
      ))}
    </MatchHistoryWrapper>
  );
}
