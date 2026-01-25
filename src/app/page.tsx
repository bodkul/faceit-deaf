"use client";

import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { differenceInMinutes } from "date-fns";
import { now } from "lodash-es";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { siteConfig } from "@/config/site";
import { useLiveMatches } from "@/hooks/useLiveMatches";

export function LiveMatches() {
  const { data: matches, isLoading } = useLiveMatches();
  const router = useRouter();

  return (
    <Card className="h-min w-full">
      <CardHeader>
        <CardTitle>Live Matches</CardTitle>
        <CardDescription>
          Currently active FACEIT matches in the deaf community
        </CardDescription>
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
                  <TableCell colSpan={4} className="p-0">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <IconDeviceGamepad2 />
                        </EmptyMedia>
                        <EmptyTitle>No live matches</EmptyTitle>
                        <EmptyDescription>
                          There are no active matches right now. Check back
                          later!
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
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

export default function Page() {
  return (
    <>
      <div className="container flex flex-col items-center gap-2 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
        <h1 className="max-w-2xl text-balance font-semibold text-4xl leading-tighter tracking-tight lg:font-semibold lg:leading-[1.1] xl:text-5xl xl:tracking-tighter">
          Welcome to <span className="text-primary">{siteConfig.name}</span>
          .pro
        </h1>
        <p className="max-w-3xl text-balance text-base sm:text-lg">
          FaceitDeaf is a platform for tracking, analyzing, and watching FACEIT
          matches for deaf and hard-of-hearing players. Enjoy a modern
          interface, live match updates, detailed statistics, and a friendly
          environment for everyone who loves CS2.
        </p>
      </div>
      <LiveMatches />
    </>
  );
}
