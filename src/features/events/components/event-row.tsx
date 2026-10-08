import {
  IconCalendar,
  IconChevronRight,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventStatusPill } from "@/features/events/components/event-status-pill";
import {
  formatEventDates,
  getEventStatus,
} from "@/features/events/lib/event-status";
import type { EventListItem } from "@/features/events/queries";

export function EventRow({ event }: { event: EventListItem }) {
  const status = getEventStatus(event.start_date, event.end_date);

  return (
    <Link
      href={`/events/${event.slug}/matches`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-(--highlight) transition-colors hover:border-border-strong hover:bg-foreground/3"
    >
      <Avatar className="size-12 shrink-0 rounded-lg after:rounded-lg after:border-border">
        <AvatarImage
          className="rounded-lg bg-black object-contain"
          src={event.logo_url ?? undefined}
          alt=""
        />
        <AvatarFallback className="rounded-lg font-bold">
          {event.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="line-clamp-2 font-semibold">{event.name}</span>
          <EventStatusPill status={status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="size-4 text-faint" />
            {formatEventDates(event.start_date, event.end_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsersGroup className="size-4 text-faint" />
            {event.teamsCount} teams
          </span>
        </div>
      </div>

      <IconChevronRight className="size-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
