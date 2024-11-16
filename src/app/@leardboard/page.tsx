import { getPlayers } from "@/lib/database/players";
import PlayersList from "./PlayersList";

export default async function Page() {
  const players = await getPlayers();

  return <PlayersList initialPlayers={players} />;
}
