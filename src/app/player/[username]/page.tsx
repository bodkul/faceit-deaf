import { notFound } from "next/navigation";

import { TabsContent } from "@/components/ui/tabs";
import { getPlayerByUsername } from "@/lib/supabase";

import { Maps } from "./_components/Maps";
import MatchHistory from "./_components/MatchHistory";
import { PlayerCard } from "./_components/PlayerCard";
import { PlayerTabs } from "./_components/PlayerTabs";
import RecentMatches from "./_components/RecentMatches";
import Statistics from "./_components/Statistics";

export async function generateMetadata(props: PageProps<"/player/[username]">) {
  const { username } = await props.params;

  return { title: username };
}

export default async function Page(props: PageProps<"/player/[username]">) {
  const { username } = await props.params;

  const player = await getPlayerByUsername(username);

  if (!player) return notFound();

  return (
    <>
      <PlayerCard player={player} />

      <PlayerTabs>
        <TabsContent className="space-y-4" value="overview">
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
