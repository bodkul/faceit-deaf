"use client";

import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useRecentMatches } from "@/hooks/useRecentMatches";

import { MatchHistoryTableHead } from "./MatchHistoryTableHead";
import { MatchHistoryTableRow } from "./MatchHistoryTableRow";
import renderLoadingRows from "./renderLoadingRows";

function RecentMatchesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Last 10 played matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <MatchHistoryTableHead />
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentMatchesLoading() {
  const rows = renderLoadingRows(10);

  return <RecentMatchesLayout>{rows}</RecentMatchesLayout>;
}

export default function RecentMatches({ playerId }: { playerId: string }) {
  const { data, isLoading } = useRecentMatches(playerId);

  const rows = useMemo(() => {
    if (!data?.length) return null;

    return data.map((match) => (
      <MatchHistoryTableRow key={match.id} match={match} />
    ));
  }, [data]);

  if (isLoading) return <RecentMatchesLoading />;

  return <RecentMatchesLayout>{rows}</RecentMatchesLayout>;
}
