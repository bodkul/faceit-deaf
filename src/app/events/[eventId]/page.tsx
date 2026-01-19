"use client";

import {
  IconCalendar,
  IconHistory,
  IconMapPin,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format, isBefore, isWithinInterval } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
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
import { useEventTeams } from "@/hooks/useTeams";
import { getCountryFlagUrl } from "@/lib/country";
import { supabaseClient } from "@/lib/supabase";

function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
}

function EventTeamCard({
  team,
}: {
  team: {
    id: string;
    name: string;
    avatar: string | null;
    country: string | null;
  };
}) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {team.avatar ? (
              <Image
                src={team.avatar}
                alt={team.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground text-xl">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-1 items-center gap-2">
            {team.country && (
              <Image
                src={getCountryFlagUrl(team.country, 20)}
                alt={team.country}
                width={20}
                height={13}
                className="shrink-0"
              />
            )}
            <span className="font-semibold">{team.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: eventTeams, isLoading: teamsLoading } = useEventTeams(eventId);

  if (eventLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const now = new Date();
  const isOngoing = isWithinInterval(now, {
    start: event.start_date,
    end: event.end_date,
  });
  const isPast = isBefore(event.end_date, now);

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={event.avatar}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-2xl">{event.name}</h1>
                {isOngoing && (
                  <Badge className="bg-green-500/10 text-green-500">Live</Badge>
                )}
                {isPast && <Badge variant="secondary">Completed</Badge>}
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <IconMapPin className="size-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <IconCalendar className="size-4" />
                  {`${format(event.start_date, "MMM d")} - ${format(event.end_date, "MMM d, yyyy")}`}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Content */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teams">
            <TabsList className="mb-4">
              <TabsTrigger value="teams">Teams</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="teams">
              {teamsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !eventTeams?.length ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconUsers />
                    </EmptyMedia>
                    <EmptyTitle>No teams yet</EmptyTitle>
                    <EmptyDescription>
                      Teams will appear here once they register.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eventTeams.map((et) =>
                    et.team ? (
                      <EventTeamCard key={et.id} team={et.team} />
                    ) : null,
                  )}
                </div>
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
                    Match schedule will be available here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </TabsContent>

            <TabsContent value="results">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconTrophy />
                  </EmptyMedia>
                  <EmptyTitle>Coming soon</EmptyTitle>
                  <EmptyDescription>
                    Results will be available after the event.
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
