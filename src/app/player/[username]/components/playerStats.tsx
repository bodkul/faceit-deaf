import usePlayerStats from "@/hooks/queries/usePlayerStats";
import calculateAverageStats from "@/lib/calculateAverageStats";

import Stat from "./stat";

export default function PlayerStats({ playerId }: { playerId: string }) {
  const { data, isLoading } = usePlayerStats(playerId);

  const stats = calculateAverageStats(
    data?.flatMap(({ player_stats_normalized }) => {
      return {
        Rounds: "0",
        Assists: player_stats_normalized?.assists ?? "0",
        Deaths: player_stats_normalized?.deaths ?? "0",
        Kills: player_stats_normalized?.kills ?? "0",
        Headshots: player_stats_normalized?.headshots ?? "0",
        ADR: player_stats_normalized?.adr ?? "0",
        "K/R Ratio": player_stats_normalized?.kr_ratio ?? "0",
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
