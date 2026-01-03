import { notFound } from "next/navigation";

import { Maps } from "@/app/player/[username]/_components/Maps";
import { TabsContent } from "@/components/ui/tabs";
import { PlayerCard, PlayerTabs } from "@/features/player";
import { RecentMatches } from "@/features/recent-matches/recent-matches";
import { getPlayerByUsername } from "@/lib/supabase/players";

import MatchHistory from "./_components/MatchHistory";
import Statistics from "./_components/Statistics";

export async function generateMetadata({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

  return { title: username };
}

export default async function Page({
  params,
}: PageProps<"/player/[username]">) {
  const { username } = await params;

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
