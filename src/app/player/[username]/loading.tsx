"use client";

import { TabsContent } from "@/components/ui/tabs";

import { PlayerCardSceleton } from "./_components/PlayerCard";
import { PlayerTabs } from "./_components/PlayerTabs";
import { RecentMatchesLoading } from "./_components/RecentMatches";
import { StatisticsLoading } from "./_components/Statistics";

export default function Loading() {
  return (
    <>
      <PlayerCardSceleton />

      <PlayerTabs>
        <TabsContent value="overview" className="space-y-4">
          <StatisticsLoading />
          <RecentMatchesLoading />
        </TabsContent>
      </PlayerTabs>
    </>
  );
}
