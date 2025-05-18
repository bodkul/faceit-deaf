"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import useMatch from "@/hooks/queries/useMatch";

import { MatchHeader } from "./components/MatchHeader";
import { TeamStatsTable } from "./components/TeamStatsTable";
import Loading from "./loading";

export default function Page(props: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(props.params);
  const { match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return notFound();
  }

  const totalScore = match.teams.reduce(
    (sum, team) => sum + (team.final_score ?? 0),
    0,
  );

  return (
    <>
      <MatchHeader match={match} />
      <div className="flex space-x-12">
        <div className="flex flex-col space-y-6 w-full">
          <h5 className="text-3xl font-bold">Stats</h5>
          {match.teams.map((team) => (
            <TeamStatsTable key={team.id} team={team} totalScore={totalScore} />
          ))}
        </div>
      </div>
    </>
  );
}
