import usePlayerStats from "@/hooks/queries/usePlayerStats";
import calculateAverageStats from "@/lib/calculateAverageStats";

import Stat from "./stat";

export default function PlayerStats({ playerId }: { playerId: string }) {
  const { data, isLoading } = usePlayerStats(playerId);

  const stats = calculateAverageStats(
    data?.flatMap((item) => {
      return {
        Rounds: String(item.rounds),
        Assists: item.assists,
        Deaths: item.deaths,
        Kills: item.kills,
        Headshots: item.headshots,
        ADR: item.adr,
        "K/R Ratio": item.kpr,
      };
    }) ?? [],
  );

  return (
    <>
      <Stat
        name="Rating 2.0"
        value={stats.rating.toFixed(2)}
        isLoading={isLoading}
      />
      <Stat name="K/D" value={stats.kd.toFixed(2)} isLoading={isLoading} />
      <Stat name="HS %" value={stats.hsp.toFixed(2)} isLoading={isLoading} />
    </>
  );
}
