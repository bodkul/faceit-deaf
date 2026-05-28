import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/db/events";

import { EventHeader } from "../_components/event-header";
import { EventTabs } from "../_components/event-tabs";

export default async function EventMatchesPage({
  params,
}: PageProps<"/events/[slug]/matches">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <EventTabs slug={slug} activeTab="matches" />
    </div>
  );
}
