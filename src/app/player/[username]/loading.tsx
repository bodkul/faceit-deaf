"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PlayerCardSceleton } from "./_components/PlayerCard";
import { RecentMatchesLoading } from "./_components/RecentMatches";
import { StatisticsLoading } from "./_components/Statistics";

export default function Loading() {
  return (
    <>
      <PlayerCardSceleton />

      <div className="lg:col-span-2">
        <Tabs defaultValue="overview" className="gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StatisticsLoading />
            <RecentMatchesLoading />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
