import type { Metadata } from "next";

import { EventTeamsClient } from "@/features/events/components/event-teams";
import { ensureEventExists } from "@/features/events/queries";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]/matches">): Promise<Metadata> {
  const { slug } = await params;
  const event = await ensureEventExists(slug);

  return {
    title: event.name,
    description: `Event ${event.name} on csdeaf.pro`,
  };
}

export default async function EventTeamsPage({
  params,
}: PageProps<"/events/[slug]/teams">) {
  const { slug } = await params;
  const event = await ensureEventExists(slug);

  return <EventTeamsClient event={event} />;
}
