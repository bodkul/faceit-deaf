"use client";

import { IconHistory } from "@tabler/icons-react";
import { range } from "es-toolkit/math";
import { useMemo } from "react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentMatches } from "@/hooks/useRecentMatches";

import { MatchesTableHead, MatchesTableRow } from "./matches";

function RecentMatchesWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="border-neutral-800 border-b px-5 py-4">
        <h3 className="font-bold text-white">Recent Matches</h3>
        <p className="text-neutral-500 text-sm">Last 10 played matches</p>
      </div>
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <MatchesTableHead />
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function RecentMatchesSkeleton() {
  const SKELETON_COLS = [
    { key: "date", w: 24 },
    { key: "map", w: 12 },
    { key: "score", w: 10 },
    { key: "kd", w: 12 },
    { key: "kdr", w: 8 },
    { key: "adr", w: 8 },
  ];
  return (
    <RecentMatchesWrapper>
      {range(10).map((index) => (
        <tr
          key={index}
          className="border-neutral-800/50 border-b last:border-0"
        >
          {SKELETON_COLS.map(({ key, w }) => (
            <td key={key} className="px-4 py-3">
              <Skeleton className={`mx-auto h-4 w-${w} bg-neutral-800`} />
            </td>
          ))}
        </tr>
      ))}
    </RecentMatchesWrapper>
  );
}

export default function RecentMatches({ playerId }: { playerId: string }) {
  const { data, isLoading } = useRecentMatches(playerId);

  const rows = useMemo(() => {
    if (!data?.length) return null;
    return data.map((match) => (
      <MatchesTableRow key={match.id} match={match} />
    ));
  }, [data]);

  if (isLoading) return <RecentMatchesSkeleton />;

  if (!rows) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="mb-4">
          <h3 className="font-bold text-white">Recent Matches</h3>
          <p className="text-neutral-500 text-sm">Last 10 played matches</p>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconHistory />
            </EmptyMedia>
            <EmptyTitle>No matches yet</EmptyTitle>
            <EmptyDescription>
              Recent matches will appear here once played.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return <RecentMatchesWrapper>{rows}</RecentMatchesWrapper>;
}
