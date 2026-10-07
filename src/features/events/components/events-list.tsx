import { TZDate } from "@date-fns/tz";
import {
  IconCalendar,
  IconCalendarX,
  IconUsersGroup,
} from "@tabler/icons-react";
import { format, getYear, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { sortBy, uniqBy } from "es-toolkit";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Meta } from "@/features/events/components/event-meta";
import {
  EVENT_TZ,
  type EventStatus,
  getEventStatus,
} from "@/features/events/lib/event-status";
import { normalizeTeamName } from "@/features/events/lib/normalize-team-name";
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();

function StatusIndicator({ status }: { status: EventStatus }) {
  if (status === "ongoing") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-green-500" />
        </span>
        <span className="font-bold font-mono text-green-400 text-xs uppercase tracking-widest">
          Ongoing
        </span>
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-yellow-500" />
        </span>
        <span className="font-bold font-mono text-xs text-yellow-400 uppercase tracking-widest">
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

export async function EventsList() {
  const { data } = await supabase
    .from("events")
    .select(
      "id, name, logo_url, start_date, end_date, slug, event_matches(event_match_teams(team_name))",
    )
    .throwOnError();

  const events = sortBy(data, [(t) => -parseISO(t.start_date).getTime()]);

  if (events.length === 0) {
    return (
      <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconCalendarX />
              </EmptyMedia>
              <EmptyTitle>No events found</EmptyTitle>
              <EmptyDescription>
                There are no events to display right now.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ItemGroup>
        {events.map((event) => {
          const yearFormat = (date: string) =>
            getYear(date) === getYear(new Date()) ? "d MMM" : "d MMM yyyy";

          const start = format(
            new TZDate(event.start_date, EVENT_TZ),
            yearFormat(event.start_date),
            { locale: enUS },
          );
          const end = event.end_date
            ? format(
                new TZDate(event.end_date, EVENT_TZ),
                yearFormat(event.end_date),
                { locale: enUS },
              )
            : null;

          const status = getEventStatus(event.start_date, event.end_date);

          const teams = uniqBy(
            event.event_matches.flatMap((match) => match.event_match_teams),
            (team) => normalizeTeamName(team.team_name),
          );

          return (
            <Item
              key={event.id}
              variant="outline"
              className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm [a]:hover:bg-neutral-900/30"
              render={<Link href={`/events/${event.slug}/matches`} />}
            >
              <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/3 blur-3xl" />
              <ItemMedia>
                <Avatar size="lg" className="rounded-md after:rounded-md">
                  <AvatarImage
                    className="rounded-md"
                    src={event.logo_url ?? undefined}
                  />
                  <AvatarFallback className="rounded-md">
                    {event.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <div className="flex items-center justify-between">
                  <ItemTitle className="transition-colors group-hover/item:text-red-500">
                    {event.name}
                  </ItemTitle>
                  <StatusIndicator status={status} />
                </div>
                <div className="line-clamp-2 flex gap-2 text-left font-normal text-muted-foreground text-sm leading-normal">
                  <Meta icon={IconCalendar}>
                    {end ? `${start} — ${end}` : start}
                  </Meta>
                  <Meta icon={IconUsersGroup}>{teams.length} teams</Meta>
                </div>
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>
    </div>
  );
}
