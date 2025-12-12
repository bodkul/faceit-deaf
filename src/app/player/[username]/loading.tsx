import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PlayerCardSceleton } from "./_components/PlayerCard";

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <PlayerCardSceleton />

      <div className="lg:col-span-2">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>
                      Based on the last 20 matches
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 items-center justify-end space-x-2 rounded-lg border bg-muted/50 p-2">
                      <Switch id="all-time-toggle" disabled />
                      <Label htmlFor="all-time-toggle">All Time</Label>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      K/D
                    </span>
                  </Skeleton>
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      Headshots
                    </span>
                  </Skeleton>
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      Winrate
                    </span>
                  </Skeleton>
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      Total Matches
                    </span>
                  </Skeleton>
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      Kills per Round
                    </span>
                  </Skeleton>
                  <Skeleton className="relative flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-13 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      +/- ELO
                    </span>
                  </Skeleton>
                  <Skeleton className="relative col-span-2 flex min-h-22.5 flex-col items-center justify-center space-y-1 rounded-lg border border-border bg-muted/30 p-4 pb-12 transition-colors hover:bg-muted/50">
                    <span className="flex gap-1 text-sm font-medium text-muted-foreground">
                      W/L History
                    </span>
                  </Skeleton>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elo Statistics</CardTitle>
                <CardDescription>Based on the last 20 matches</CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
