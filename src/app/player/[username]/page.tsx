import { notFound } from "next/navigation";

import { TabsContent } from "@/components/ui/tabs";
import { getPlayerByUsername } from "@/lib/supabase/players";

import { Maps } from "./_components/Maps";
import MatchHistory from "./_components/MatchHistory";
import { PlayerCard } from "./_components/PlayerCard";
import { PlayerTabs } from "./_components/PlayerTabs";
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
    <>
      <PlayerCard player={player} />

      <PlayerTabs>
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
      </PlayerTabs>
    </>
  );
}
