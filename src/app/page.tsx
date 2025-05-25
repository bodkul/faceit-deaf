import { EloRankings } from "@/components/EloRankings";
import { LiveMatches } from "@/components/LiveMatches";

export default function Page() {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to faceitdeaf
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveMatches />
        <EloRankings />
      </div>
    </>
  );
}
