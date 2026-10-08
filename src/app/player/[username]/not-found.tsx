import { NotFoundState } from "@/components/not-found-state";

export default function PlayerNotFound() {
  return (
    <NotFoundState
      title="Player not found"
      description="We don't track a player with this nickname. Check the spelling or search from the rankings."
    />
  );
}
