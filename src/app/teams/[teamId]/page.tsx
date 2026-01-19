"use client";

import { IconCalendarEvent, IconHistory, IconUsers } from "@tabler/icons-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";

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

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const { data: team, isLoading } = useTeam(teamId);

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
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconUsers />
                  </EmptyMedia>
                  <EmptyTitle>Coming soon</EmptyTitle>
                  <EmptyDescription>
                    Team roster will be available here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
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
