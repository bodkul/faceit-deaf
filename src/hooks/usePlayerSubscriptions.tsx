import { useEffect, useState } from "react";
import { PlayerWithEloHistory } from "@/types/database";
import { supabase } from "@/lib/supabaseClient";
import { getPlayers } from "@/lib/database/players";

export default function usePlayerSubscriptions(
  initialPlayers: PlayerWithEloHistory[] = []
) {
  const [players, setPlayers] =
    useState<PlayerWithEloHistory[]>(initialPlayers);

  useEffect(() => {
    const playersSubscription = supabase
      .channel("public:players")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => {
          getPlayers().then(setPlayers);
        }
      )
      .subscribe();

    const eloHistorySubscription = supabase
      .channel("public:eloHistory")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "eloHistory" },
        () => {
          getPlayers().then(setPlayers);
        }
      )
      .subscribe();

    return () => {
      playersSubscription.unsubscribe();
      eloHistorySubscription.unsubscribe();
    };
  }, []);

  return players;
}
