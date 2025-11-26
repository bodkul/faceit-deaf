"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { useMatchesSubscription } from "@/hooks/useMatchesSubscription";
import { useRecentMatches } from "@/hooks/useRecentMatches";

import { MatchHistoryTableHead } from "./MatchHistoryTableHead";
import { MatchHistoryTableRow } from "./MatchHistoryTableRow";
import renderLoadingRows from "./renderLoadingRows";

export default function RecentMatches({ playerId }: { playerId: string }) {
  const { data, isLoading, mutate } = useRecentMatches(playerId);

  useMatchesSubscription(() => mutate().then());

  const rows = useMemo(() => {
    if (isLoading) return renderLoadingRows(10);
    if (!data?.length) return null;

    return data.map((match) => (
      <MatchHistoryTableRow key={match.id} match={match} />
    ));
  }, [isLoading, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <MatchHistoryTableHead />
            </TableHeader>
            <TableBody>{rows}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
