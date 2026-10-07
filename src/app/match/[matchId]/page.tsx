import { MatchView } from "@/features/match/components/match-view";

export default async function MatchPage({
  params,
}: PageProps<"/match/[matchId]">) {
  const { matchId } = await params;

  return <MatchView matchId={matchId} />;
}
