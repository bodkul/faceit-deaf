"use client";

import { differenceInMinutes } from "date-fns";
import { now } from "lodash-es";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLiveMatches } from "@/hooks/useLiveMatches";

export function LiveMatches() {
  const { data: matches, isLoading } = useLiveMatches();
  const router = useRouter();

  return (
    <Card className="h-min w-full">
      <CardHeader>
        <CardTitle>Live Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5 text-center">Live</TableHead>
                <TableHead className="w-1/5 text-center">Score</TableHead>
                <TableHead className="w-1/5 text-center">Map</TableHead>
                <TableHead className="w-2/5 text-center">Players</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Spinner className="inline-block" />
                  </TableCell>
                </TableRow>
              ) : matches?.length ? (
                matches.map((match) => (
                  <TableRow
                    key={match.id}
                    className="cursor-pointer whitespace-nowrap text-center"
                    onClick={() => router.push(`/match/1-${match.id}`)}
                  >
                    <TableCell>
                      {match.finished_at
                        ? "Finished"
                        : match.started_at
                          ? `${differenceInMinutes(now(), match.started_at)}m`
                          : "Soon"}
                    </TableCell>
                    <TableCell>{match.round_score ?? "0 / 0"}</TableCell>
                    <TableCell className="text-[#87a3bf] capitalize">
                      {match.map_pick?.replace("de_", "")}
                    </TableCell>
                    <TableCell className="flex flex-wrap justify-center gap-1">
                      {match.players?.map((nickname) => (
                        <Badge
                          key={`${match.id}_${nickname}`}
                          variant="outline"
                        >
                          {nickname}
                        </Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No matches.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
