"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerTabs } from "@/features/player/player-tabs";
import { RecentMatchesLoading } from "@/features/recent-matches";

import { StatisticsLoading } from "./_components/Statistics";

export default function Loading() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col items-center space-y-2 text-center">
          <Avatar className="size-28">
            <AvatarFallback>
              <Skeleton className="size-28 rounded-full" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">
            <Skeleton className="h-6 w-32 rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-4">
          <Separator />
          <div className="flex justify-center gap-4">
            {["faceit", "steam", "twitch"].map((key) => (
              <Skeleton
                className="size-12 rounded-2xl border"
                key={`skeleton-${key}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <PlayerTabs>
        <TabsContent className="space-y-4" value="overview">
          <StatisticsLoading />
          <RecentMatchesLoading />
        </TabsContent>
      </PlayerTabs>
    </>
  );
}
