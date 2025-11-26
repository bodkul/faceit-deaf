import { notFound } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPlayerByUsername } from "@/lib/supabase/players";

import { Maps } from "./_components/Maps";
import MatchHistory from "./_components/MatchHistory";
import { PlayerCard } from "./_components/PlayerCard";
import RecentMatches from "./_components/RecentMatches";
import Statistics from "./_components/Statistics";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { username } = await params;

  return { title: username };
}

export default async function Page(props: { params: Params }) {
  const { username } = await props.params;

  const player = await getPlayerByUsername(username);

  if (!player) return notFound();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <PlayerCard player={player} />

      <div className="lg:col-span-2">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Statistics playerId={player.id} />
            <RecentMatches playerId={player.id} />
          </TabsContent>
          <TabsContent value="matches">
            <MatchHistory playerId={player.id} />
          </TabsContent>
          <TabsContent value="maps">
            <Maps playerId={player.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
