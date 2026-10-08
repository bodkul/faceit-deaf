import { IconCalendarX } from "@tabler/icons-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EventRow } from "@/features/events/components/event-row";
import { getEvents } from "@/features/events/queries";

export async function EventsList() {
  const events = await getEvents();

  if (events.length === 0) {
    return (
      <Empty className="rounded-xl border border-border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCalendarX />
          </EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            Tournaments will show up here once they are announced.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
