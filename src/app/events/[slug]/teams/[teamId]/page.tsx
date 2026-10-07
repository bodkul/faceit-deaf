import { EventTeamView } from "@/features/events/components/event-team-view";

export default async function EventTeamPage({
  params,
}: PageProps<"/events/[slug]/teams/[teamId]">) {
  const { slug, teamId } = await params;

  return <EventTeamView slug={slug} teamId={teamId} />;
}
