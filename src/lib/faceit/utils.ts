import type { MatchPayload } from "./webhooks/types";

export const GAME = "cs2";

/** Strips the FACEIT region prefix: "1-<uuid>" → "<uuid>". */
export function getMatchId({ id }: { id: string }) {
  return id.replace(/^1-/, "");
}

export function getPlayerIds(payload: MatchPayload) {
  return payload.teams.flatMap((team) => team.roster.map((p) => p.id));
}
