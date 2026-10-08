import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RealtimeRefresh } from "@/components/realtime-refresh";
import { TeamView } from "@/features/teams/components/team-view";
import { getTeam } from "@/features/teams/queries";
import { eventSources } from "@/lib/realtime/topics";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/teams/[name]">): Promise<Metadata> {
  const { name } = await params;
  const team = await getTeam(decodeURIComponent(name));
  if (!team) return { title: "Team not found" };

  return {
    title: team.name,
    description: `${team.name}: ${team.wins}–${team.losses} in deaf CS2 events.`,
  };
}

export default async function TeamPage({ params }: PageProps<"/teams/[name]">) {
  const { name } = await params;
  const team = await getTeam(decodeURIComponent(name));
  if (!team) notFound();

  return (
    <>
      <RealtimeRefresh sources={eventSources} />
      <TeamView team={team} />
    </>
  );
}
