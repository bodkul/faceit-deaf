import { Suspense } from "react";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";
import { EventsList } from "@/features/events/components/events-list";
import { EventsListSkeleton } from "@/features/events/components/events-list-skeleton";

// The list is prerendered at build time; refresh it periodically.
export const revalidate = 300;

export const metadata = {
  title: "Events",
  description:
    "Deaf CS2 tournaments — follow results, standings and player stats.",
};

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>{metadata.title}</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      <Suspense fallback={<EventsListSkeleton />}>
        <EventsList />
      </Suspense>
    </div>
  );
}
