import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/db/events";

import { EventHeader } from "../_components/event-header";
import { EventTabs } from "../_components/event-tabs";

export default async function EventTeamsPage({
  params,
}: PageProps<"/events/[slug]/teams">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <EventTabs slug={slug} activeTab="teams" />
    </div>
  );
}
