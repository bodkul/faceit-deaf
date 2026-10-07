import { TabsNav } from "@/components/layout/tabs-nav";
import { EventCard } from "@/features/events/components/event-card";
import { ensureEventExists } from "@/features/events/queries";

const EVENT_TABS = [
  { value: "matches", label: "Matches", path: "/matches" },
  { value: "teams", label: "Teams", path: "/teams" },
  { value: "players", label: "Players", path: "/players" },
] as const;

export default async function EventLayout({
  children,
  params,
}: LayoutProps<"/events/[slug]">) {
  const { slug } = await params;
  await ensureEventExists(slug);

  return (
    <div className="flex flex-col gap-4">
      <EventCard slug={slug} />
      <TabsNav basePath={`/events/${slug}`} tabs={EVENT_TABS} />
      {children}
    </div>
  );
}
