import { NotFoundState } from "@/components/not-found-state";

export default function MatchNotFound() {
  return (
    <NotFoundState
      title="Match not found"
      description="Only matches with tracked deaf players are recorded. This one isn't one of them."
    />
  );
}
