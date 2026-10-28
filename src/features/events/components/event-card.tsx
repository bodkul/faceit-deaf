"use client";

import {
  IconCalendar,
  IconTrophy,
  IconUsersGroup,
  IconWorld,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EventStatusPill } from "@/features/events/components/event-status-pill";
import {
  formatEventDates,
  getEventStatus,
} from "@/features/events/lib/event-status";
import { getEventBySlug } from "@/features/events/queries";
import { useRealtime } from "@/hooks/use-realtime";
import { eventSources } from "@/lib/realtime/topics";
import { createClient } from "@/lib/supabase/client";

function EventCardShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]"
      />
      <div className="flex items-center gap-4 p-5 sm:gap-5 sm:p-8">
        {children}
      </div>
    </section>
  );
}

export function EventCard({ slug }: { slug: string }) {
  const queryKey = ["event-card", slug];

  const {
    data: event,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey,
    queryFn: () => getEventBySlug(createClient(), slug),
  });

  useRealtime(queryKey, eventSources);

  if (isSuccess && !event) notFound();

  if (isPending || !event) {
    return (
      <EventCardShell>
        <Skeleton className="size-16 rounded-xl sm:size-20" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </EventCardShell>
    );
  }

  return (
    <EventCardShell>
      <Avatar className="size-16 shrink-0 rounded-xl ring-2 ring-border-strong after:rounded-xl sm:size-20">
        <AvatarImage
          className="rounded-xl bg-black object-contain"
          src={event.logo_url ?? undefined}
          alt=""
        />
        <AvatarFallback className="rounded-xl">
          <IconTrophy className="size-8" />
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-xl font-black tracking-tight sm:text-3xl">
            {event.name}
          </h1>
          <EventStatusPill
            status={getEventStatus(event.start_date, event.end_date)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="size-4 text-faint" />
            {formatEventDates(event.start_date, event.end_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsersGroup className="size-4 text-faint" />
            {event.teams.count} teams
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconWorld className="size-4 text-faint" />
            Online
          </span>
        </div>
      </div>
    </EventCardShell>
  );
}
