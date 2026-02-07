import { RecentMatchesSkeleton } from "./_components/recent-matches-client";
import { StatisticsSkeleton } from "./_components/statistics-client";

export default function PlayerOverviewLoading() {
  return (
    <>
      <StatisticsSkeleton />
      <RecentMatchesSkeleton />
    </>
  );
}
