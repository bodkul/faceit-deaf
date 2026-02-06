"use client";

import { IconHistory } from "@tabler/icons-react";
import { range } from "lodash-es";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRecentMatches } from "@/hooks/useRecentMatches";

import { MatchesTableHead } from "./MatchesTableHead";
import { MatchesTableRow } from "./MatchesTableRow";

function RecentMatchesLayout({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Last 10 played matches</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <MatchesTableHead />
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentMatchesLoading() {
  return (
    <RecentMatchesLayout>
      {range(10).map((index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-10" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-8" />
          </TableCell>
          <TableCell>
            <Skeleton className="mx-auto h-5 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </RecentMatchesLayout>
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

  if (isLoading) return <RecentMatchesLoading />;

  if (!rows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
          <CardDescription>Last 10 played matches</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  return <RecentMatchesLayout>{rows}</RecentMatchesLayout>;
}
