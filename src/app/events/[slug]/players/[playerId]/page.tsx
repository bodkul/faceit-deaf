import { EventPlayerView } from "@/features/events/components/event-player-view";

export default async function EventPlayerPage({
  params,
}: PageProps<"/events/[slug]/players/[playerId]">) {
  const { slug, playerId } = await params;

  return <EventPlayerView slug={slug} playerId={playerId} />;
}
