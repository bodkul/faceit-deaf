import type { MatchPayload } from "./match-events";

export const formatNumberWithSign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export function getMatchId(payload: MatchPayload) {
  return payload.id.replace(/^1-/, "");
}

export function getPlayerIds(payload: MatchPayload) {
  return payload.teams.flatMap((team) => team.roster.map((p) => p.id));
}
