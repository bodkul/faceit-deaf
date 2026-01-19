"use client";

import { IconCalendarEvent } from "@tabler/icons-react";
import { format, isWithinInterval } from "date-fns";
import { now } from "lodash-es";
import Image from "next/image";
import Link from "next/link";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePastEvents, useUpcomingEvents } from "@/hooks/useEvents";

function EventCard({
  event,
}: {
  event: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    start_date: string;
    end_date: string;
  };
}) {
  const isOngoing = isWithinInterval(now(), {
    start: event.start_date,
    end: event.end_date,
  });

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <Image
              src={event.avatar}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{event.name}</span>
              {isOngoing && (
                <Badge className="bg-green-500/10 text-green-500">Live</Badge>
              )}
            </div>
            <span className="text-muted-foreground text-sm">
              {event.location}
            </span>
            <span className="text-muted-foreground text-xs">
              {`${format(event.start_date, "MMM d")} - ${format(event.end_date, "MMM d, yyyy")}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EventsList({
  events,
  isLoading,
  emptyMessage,
  emptyDescription,
}: {
  events:
    | Array<{
        id: string;
        name: string;
        avatar: string;
        location: string;
        start_date: string;
        end_date: string;
      }>
    | null
    | undefined;
  isLoading: boolean;
  emptyMessage: string;
  emptyDescription: string;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!events?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCalendarEvent />
          </EmptyMedia>
          <EmptyTitle>{emptyMessage}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function EventsPage() {
  const { data: upcomingEvents, isLoading: upcomingLoading } =
    useUpcomingEvents();
  const { data: pastEvents, isLoading: pastLoading } = usePastEvents();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Upcoming and past tournaments for the deaf CS2 community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <EventsList
              events={upcomingEvents}
              isLoading={upcomingLoading}
              emptyMessage="No upcoming events"
              emptyDescription="Check back later for new tournaments."
            />
          </TabsContent>

          <TabsContent value="past">
            <EventsList
              events={pastEvents}
              isLoading={pastLoading}
              emptyMessage="No past events"
              emptyDescription="Past tournaments will appear here."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
