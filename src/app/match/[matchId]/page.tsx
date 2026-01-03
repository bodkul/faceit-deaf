"use client";

import { sumBy } from "lodash-es";
import { notFound } from "next/navigation";
import { use } from "react";

import { useMatch } from "@/hooks/useMatch";

import { MatchHeader } from "./_components/MatchHeader";
import { TeamStatsTable } from "./_components/TeamStatsTable";
import Loading from "./loading";

export default function Page(props: PageProps<"/match/[matchId]">) {
  const { matchId } = use(props.params);
  const { data: match, isLoading } = useMatch(matchId.replace(/^1-/, ""));

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
          <h5 className="font-bold text-3xl">Stats</h5>
          {match.teams.map((team) => (
            <TeamStatsTable key={team.id} team={team} totalScore={totalScore} />
          ))}
        </div>
      </div>
    </>
  );
}
