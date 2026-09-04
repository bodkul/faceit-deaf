"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { format, getYear, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { sortBy } from "es-toolkit";
import Link from "next/link";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabaseClient } from "@/lib/supabase";

type EventStatus = "upcoming" | "ongoing" | "finished";

const CARD_STYLES: Record<EventStatus, string> = {
  ongoing:
    "border-red-500/30 bg-linear-to-b from-red-950/30 to-neutral-900 shadow-red-950/20",
  upcoming:
    "border-yellow-500/20 bg-linear-to-b from-yellow-950/20 to-neutral-900",
  finished:
    "border-neutral-800 bg-linear-to-b from-neutral-800/30 to-neutral-900",
};

const TOP_LINE_STYLES: Record<EventStatus, string> = {
  ongoing: "bg-linear-to-r from-transparent via-red-500/60 to-transparent",
  upcoming: "bg-linear-to-r from-transparent via-yellow-500/40 to-transparent",
  finished: "bg-linear-to-r from-transparent via-neutral-700/40 to-transparent",
};

function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("events")
        .select("*")
        .throwOnError();

      return sortBy(data ?? [], [(t) => -parseISO(t.start_date).getTime()]);
    },
  });
}

function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function EmptyState({ message = "Nothing found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 border-dashed py-16 text-center">
      <p className="text-sm text-zinc-600">{message}</p>
    </div>
  );
}

function getEventStatus(
  startDate: string,
  endDate: string | null,
): EventStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (now < start) return "upcoming";
  if (end && now > end) return "finished";
  return "ongoing";
}

function StatusIndicator({ status }: { status: EventStatus }) {
  if (status === "ongoing") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500" />
        </span>
        <span className="font-bold font-mono text-red-400 text-xs uppercase tracking-widest">
          Ongoing
        </span>
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-yellow-400/80" />
        <span className="font-bold font-mono text-xs text-yellow-400/80 uppercase tracking-widest">
          Upcoming
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2 rounded-full bg-neutral-600" />
      <span className="font-bold font-mono text-neutral-500 text-xs uppercase tracking-widest">
        Finished
      </span>
    </div>
  );
}

function getDateFormatPattern(date: string) {
  return getYear(date) === getYear(new Date()) ? "d MMM" : "d MMM yyyy";
}

function EventCard({
  event,
}: {
  event: NonNullable<ReturnType<typeof useEvents>["data"]>[number];
}) {
  const start = format(
    event.start_date,
    getDateFormatPattern(event.start_date),
    {
      locale: enUS,
    },
  );
  const end = event.end_date
    ? format(event.end_date, getDateFormatPattern(event.end_date), {
        locale: enUS,
      })
    : null;

  const status = getEventStatus(event.start_date, event.end_date);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl",
        CARD_STYLES[status],
      )}
    >
      <div
        className={cn("absolute inset-x-0 top-0 h-px", TOP_LINE_STYLES[status])}
      />

      <div className="flex items-center gap-4 p-4">
        <Avatar className="size-12 rounded-lg">
          <AvatarImage src={event.logo_url} />
          <AvatarFallback className="rounded-lg">
            {event.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <StatusIndicator status={status} />
            <span className="rounded-md border border-neutral-700/50 bg-neutral-800/60 px-2 py-0.5 font-mono text-neutral-400 text-xs">
              {start}
              {end ? ` — ${end}` : ""}
            </span>
          </div>
          <h3 className="font-semibold">{event.name}</h3>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();

  return (
    <div className="space-y-8">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>Events</PageHeaderTitle>
          <PageHeaderDescription>
            CS2 events for the deaf community — follow live results and
            standings
          </PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      <div className="flex flex-col space-y-4">
        {isLoading &&
          Array.from({ length: 3 }, (_, i) => `sk-e-${i}`).map((k) => (
            <CardSkeleton key={k} />
          ))}
        {!isLoading && events?.length === 0 && (
          <EmptyState message="No events found" />
        )}
        {!isLoading && events?.map((t) => <EventCard key={t.id} event={t} />)}
      </div>
    </div>
  );
}
