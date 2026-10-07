import type { MatchPayload } from "./match-events";

export const formatNumberWithSign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** Strips the FACEIT region prefix: "1-<uuid>" → "<uuid>". */
export function getMatchId({ id }: { id: string }) {
  return id.replace(/^1-/, "");
}

export function getPlayerIds(payload: MatchPayload) {
  return payload.teams.flatMap((team) => team.roster.map((p) => p.id));
}
