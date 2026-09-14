import { notFound } from "next/navigation";
import { cache } from "react";

import { getEventBySlug } from "@/lib/db/events";

export const ensureEventExists = cache(async (slug: string) => {
  const event = await getEventBySlug(slug);
  if (!event) notFound();
  return event;
});
