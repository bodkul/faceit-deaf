import { fromUnixTime } from "date-fns";

import type { MatchPayload } from "./webhooks/types";

export const GAME = "cs2";

/** Strips the FACEIT region prefix: "1-<uuid>" → "<uuid>". */
export function getMatchId({ id }: { id: string }) {
  return id.replace(/^1-/, "");
}

/** FACEIT timestamps are unix seconds; 0/absent means "not yet". */
export function unixToISO(timestamp: number | undefined) {
  return timestamp ? fromUnixTime(timestamp).toISOString() : undefined;
}

export function getPlayerIds(payload: MatchPayload) {
  return payload.teams.flatMap((team) => team.roster.map((p) => p.id));
}
