import { Suspense } from "react";

import { TabsNav } from "@/components/layout/tabs-nav";
import { PlayerCardSkeleton } from "@/features/player/components/player-card-skeleton";
import { StatisticsSkeleton } from "@/features/player/components/statistics/statistics-skeleton";
import { ensurePlayerExists } from "@/features/player/queries";

const PLAYER_TABS = [
  { value: "overview", label: "Overview", path: "" },
  { value: "matches", label: "Matches", path: "/matches" },
  { value: "maps", label: "Maps", path: "/maps" },
  { value: "events", label: "Events", path: "/events" },
] as const;

// Per-slot boundaries: a segment-level loading.tsx would wrap every
// parallel slot with the same fallback, duplicating the card skeleton.
export default async function PlayerLayout({
  playerCard,
  tabs,
  params,
}: LayoutProps<"/player/[username]">) {
  const { username } = await params;
  await ensurePlayerExists(username);

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PlayerCardSkeleton />}>{playerCard}</Suspense>
      <div className="flex flex-col gap-6">
        <TabsNav basePath={`/player/${username}`} tabs={PLAYER_TABS} />
        <Suspense fallback={<StatisticsSkeleton />}>{tabs}</Suspense>
      </div>
    </div>
  );
}
