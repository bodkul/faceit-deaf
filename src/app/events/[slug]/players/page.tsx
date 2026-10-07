import type { Metadata } from "next";

import { EventPlayersClient } from "@/features/events/components/event-players";
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

export default async function EventPlayersPage({
  params,
}: PageProps<"/events/[slug]/teams">) {
  const { slug } = await params;
  const event = await ensureEventExists(slug);

  return <EventPlayersClient event={event} />;
}
