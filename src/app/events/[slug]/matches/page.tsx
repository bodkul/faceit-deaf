import type { Metadata } from "next";

import { EventMatchesClient } from "@/features/events/components/event-matches";
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

export default async function EventMatchesPage({
  params,
}: PageProps<"/events/[slug]/matches">) {
  const { slug } = await params;
  const event = await ensureEventExists(slug);

  return <EventMatchesClient event={event} />;
}
