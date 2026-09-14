import type { Metadata } from "next";

import { ensureEventExists } from "@/app/events/[slug]/_lib/get-event";

import { EventMatchesClient } from "./page-client";

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
