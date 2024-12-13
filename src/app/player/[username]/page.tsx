"use client";

import {
  useQuery,
  useSubscription,
} from "@supabase-cache-helpers/postgrest-swr";
import * as datefns from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useMatches from "@/hooks/useMatches";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

const renderLoadingRows = (count: number) => {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-10" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-10" />
      </TableCell>
    </TableRow>
  ));
};

export default function Page({
  params: { username },
}: {
  params: { username: string };
}) {
  const {
    data: player,
    mutate,
    isLoading: isLoadingPlayer,
  } = useQuery(
    supabase.from("players").select().eq("nickname", username).single()
  );

  useSubscription(
    supabase,
    `public:players`,
    {
      event: "*",
      table: "players",
      schema: "public",
    },
    ["id"],
    {
      callback: () => {
        mutate();
        reload();
      },
    }
  );
  const {
    matches,
    isLoading: isLoadingMatches,
    reload,
  } = useMatches(player?.id);

  if (!isLoadingPlayer && !player) {
    return notFound();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            {isLoadingPlayer ? (
              <>
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-6 w-40" />
              </>
            ) : (
              <>
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={player!.avatar}
                    alt={`Avatar of ${player!.nickname}`}
                  />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-2xl font-medium leading-none">
                    {player!.nickname}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>Elo</CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoadingPlayer ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  player!.faceit_elo
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>Rating 2.0</CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoadingMatches ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  (
                    matches.reduce((acc, item) => acc + item.rating, 0) /
                    matches.length
                  ).toFixed(2)
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>K/D</CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoadingMatches ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  (
                    matches.reduce(
                      (acc, item) => acc + item.kills / item.deaths,
                      0
                    ) / matches.length
                  ).toFixed(2)
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>HS %</CardHeader>
              <CardContent className="text-2xl font-bold">
                {isLoadingMatches ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  (
                    matches.reduce(
                      (acc, item) => acc + item.headshot_precent,
                      0
                    ) / matches.length
                  ).toFixed(2)
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match histories</CardTitle>
          <CardDescription>{matches.length} matches played</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Date</TableHead>
                  <TableHead className="w-[16%]">Map</TableHead>
                  <TableHead className="w-[16%]">Score</TableHead>
                  <TableHead className="w-[16%]">K - D</TableHead>
                  <TableHead className="w-[16%]">K/D</TableHead>
                  <TableHead className="w-[16%]">Rating 2.0</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMatches
                  ? renderLoadingRows(25)
                  : matches.map((match) => {
                      const kd = (match.kills / match.deaths).toFixed(2);

                      const rating = match.rating.toFixed(2);

                      return (
                        <Link key={match.id} href={match.faceit} legacyBehavior>
                          <TableRow
                            className={cn("cursor-pointer !border-r-4", {
                              "border-r-red-600": match.result === 0,
                              "border-r-green-600": match.result === 1,
                            })}
                          >
                            <TableCell>
                              {datefns.format(
                                new Date(match.date),
                                "dd/MM/yy hh:mm"
                              )}
                            </TableCell>

                            <TableCell className="text-[#87a3bf] capitalize">
                              {match.map?.replace("de_", "")}
                            </TableCell>

                            <TableCell>{match.score}</TableCell>

                            <TableCell>
                              {`${match.kills} - ${match.deaths}`}
                            </TableCell>

                            <TableCell
                              className={cn("font-semibold", {
                                "!text-red-600": +kd < 0.95,
                                "!text-green-600": +kd > 1.05,
                                "!text-[#929a9e]": +kd >= 0.95 && +kd <= 1.05,
                              })}
                            >
                              {kd}
                            </TableCell>

                            <TableCell
                              className={cn("font-semibold", {
                                "!text-red-600": +rating < 0.95,
                                "!text-green-600": +rating > 1.05,
                                "!text-[#929a9e]":
                                  +rating >= 0.95 && +rating <= 1.05,
                              })}
                            >
                              {rating}
                            </TableCell>
                          </TableRow>
                        </Link>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
