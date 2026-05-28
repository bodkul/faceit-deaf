import { notFound, redirect } from "next/navigation";

import { getEventBySlug } from "@/lib/db/events";

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

export default async function EventPage({
  params,
}: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  redirect(`/events/${slug}/matches`);
}
