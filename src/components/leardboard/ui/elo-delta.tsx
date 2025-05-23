import type { PlayerWithEloHistory } from "../types";

export function EloDelta({ player }: { player: PlayerWithEloHistory }) {
  if (!player.eloHistory.length) return;

  const difference = player.faceit_elo - player.eloHistory[0].player_elo;
  if (difference === 0) return;

  const color = difference > 0 ? "text-green-500" : "text-red-500";
  const value = difference > 0 ? `+${difference}` : difference;

  return (
    <>
      {" "}
      <sup className={color}>{value}</sup>
    </>
  );
}
