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
    "CS2 events for the deaf community — follow live results and standings",
};

export default function EventsPage() {
  return (
    <div className="space-y-8">
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
