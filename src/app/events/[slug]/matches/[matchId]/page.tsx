import { EventMatchView } from "@/features/events/components/event-match-view";

export default async function EventMatchPage({
  params,
}: PageProps<"/events/[slug]/matches/[matchId]">) {
  const { slug, matchId } = await params;

  return <EventMatchView slug={slug} matchId={matchId} />;
}
