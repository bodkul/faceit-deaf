"use client";

import { sumBy } from "lodash";
import { notFound } from "next/navigation";
import { use } from "react";

import { useMatch } from "@/hooks/useMatch";

import { MatchHeader } from "./_components/MatchHeader";
import { TeamStatsTable } from "./_components/TeamStatsTable";
import Loading from "./loading";

export default function Page(props: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(props.params);
  const { match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

  if (!matchId.startsWith("1-")) {
    return notFound();
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!match) {
    return notFound();
  }

  const totalScore = sumBy(match.teams, (team) => team.final_score ?? 0);

  return (
    <>
      <MatchHeader match={match} />
      <div className="flex space-x-12">
        <div className="flex w-full flex-col space-y-6">
          <h5 className="text-3xl font-bold">Stats</h5>
          {match.teams.map((team) => (
            <TeamStatsTable key={team.id} team={team} totalScore={totalScore} />
          ))}
        </div>
      </div>
    </>
  );
}
