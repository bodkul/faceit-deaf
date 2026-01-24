"use client";

import { IconCalendarEvent, IconHistory, IconUsers } from "@tabler/icons-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeam } from "@/hooks/useTeams";
import { getCountryFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const { team, isLoading } = useTeam(teamId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              {team.avatar ? (
                <Image
                  src={team.avatar}
                  alt={team.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-3xl text-muted-foreground">
                  {team.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                {team.country && (
                  <Image
                    src={getCountryFlagUrl(team.country, 40)}
                    alt={team.country}
                    width={28}
                    height={21}
                    className="shrink-0"
                  />
                )}
                <h1 className="font-bold text-2xl">{team.name}</h1>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Content */}
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="roster">
            <TabsList className="mb-4">
              <TabsTrigger value="roster">Roster</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="roster">
              {team.roster && team.roster.length > 0 ? (
                <div className="space-y-3">
                  <Alert
                    variant="default"
                    className="border-orange-500/50 bg-orange-500/10"
                  >
                    <AlertTitle className="text-orange-500">
                      Demo Mode
                    </AlertTitle>
                    <AlertDescription className="text-orange-600/90">
                      Player statistics are currently displayed from ELO
                      matches. In the future, these stats will reflect
                      tournament performance and official team matches.
                    </AlertDescription>
                  </Alert>

                  {team.roster.map((player) => (
                    <div
                      key={player.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                          {player.avatar ? (
                            <Image
                              src={player.avatar}
                              alt={player.nickname}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-semibold text-muted-foreground">
                              {player.nickname.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 sm:min-w-40">
                          <div className="flex items-center gap-2">
                            {player.country && (
                              <Image
                                src={getCountryFlagUrl(player.country, 20)}
                                alt={player.country}
                                width={20}
                                height={15}
                                className="shrink-0"
                              />
                            )}
                            <p className="font-semibold">{player.nickname}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid flex-1 grid-cols-4 gap-4 text-center sm:gap-6">
                        <div className="col-start-2">
                          <p className="text-muted-foreground text-xs">Maps</p>
                          <p className="font-semibold">{player.stats.maps}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            K-D Diff
                          </p>
                          <p
                            className={cn("font-semibold", {
                              "text-green-600": player.stats.kdDiff > 0,
                              "text-red-600": player.stats.kdDiff < 0,
                            })}
                          >
                            {formatNumberWithSign(player.stats.kdDiff)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">K/D</p>
                          <p className="font-semibold">
                            {player.stats.kd.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconUsers />
                    </EmptyMedia>
                    <EmptyTitle>No players</EmptyTitle>
                    <EmptyDescription>
                      This team doesn't have any players yet.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </TabsContent>

            <TabsContent value="matches">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconHistory />
                  </EmptyMedia>
                  <EmptyTitle>Coming soon</EmptyTitle>
                  <EmptyDescription>
                    Match history will be available here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TabsContent>

            <TabsContent value="events">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconCalendarEvent />
                  </EmptyMedia>
                  <EmptyTitle>Coming soon</EmptyTitle>
                  <EmptyDescription>
                    Event participation will be available here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
