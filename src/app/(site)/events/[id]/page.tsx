import { notFound } from "next/navigation";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { getEventById } from "@/lib/db/events";

import { EventHeader } from "./_components/EventHeader";

export async function generateMetadata({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) return { title: "Event not found" };

  return {
    title: event.name,
    description: `Event ${event.name} on csdeaf.pro`,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) notFound();

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <EventHeader event={event} />
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Coming soon</EmptyTitle>
          <EmptyDescription>
            Event content will be available later
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
