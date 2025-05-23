import { insertNumberSign } from "@/lib/faceit/utils";
import type { PlayerWithPagination } from "@/types/player";

export function EloDelta({ player }: { player: PlayerWithPagination }) {
  if (!player.elo_before) return;

  const difference = player.faceit_elo! - player.elo_before;
  if (difference === 0) return;

  const color = difference > 0 ? "text-green-500" : "text-red-500";

  return (
    <>
      {" "}
      <sup className={color}>{insertNumberSign(difference)}</sup>
    </>
  );
}
