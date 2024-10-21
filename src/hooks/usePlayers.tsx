import { useState, useEffect } from "react";
import { getPlayers } from "@/lib/database/players";
import { PlayerWithEloHistory } from "@/types/database";

export default function usePlayers() {
  const [players, setPlayers] = useState<PlayerWithEloHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      const playersData = await getPlayers();
      setPlayers(playersData);
      setLoading(false);
    }

    fetchPlayers();
  }, []);

  return [players, loading] as const;
}
