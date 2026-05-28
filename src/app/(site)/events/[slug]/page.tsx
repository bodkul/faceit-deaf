import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { getEventBySlug } from "@/lib/db/events";

import { EventHeader } from "./_components/event-header";
import { EventTabs } from "./_components/event-tabs";

export async function generateMetadata({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) return { title: "Event not found" };

  return {
    title: event.name,
    description: `Event ${event.name} on csdeaf.pro`,
  };
}

function TabsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg bg-neutral-900" />
        <Skeleton className="h-9 w-20 rounded-lg bg-neutral-900" />
        <Skeleton className="h-9 w-24 rounded-lg bg-neutral-900" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl bg-neutral-900" />
      <Skeleton className="h-48 w-full rounded-2xl bg-neutral-900" />
    </div>
  );
}

export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <EventHeader event={event} />
      <Suspense fallback={<TabsSkeleton />}>
        <EventTabs slug={slug} />
      </Suspense>
    </div>
  );
}
