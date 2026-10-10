import { notFound } from "next/navigation";

import { MatchView } from "@/features/match/components/match-view";

export default async function MatchPage({
  params,
}: PageProps<"/match/[matchId]">) {
  const { matchId } = await params;
  // FACEIT room ids look like `1-<uuid>`; matches are stored without the prefix.
  if (!matchId.startsWith("1-")) notFound();

  return <MatchView matchId={matchId.slice(2)} />;
}
