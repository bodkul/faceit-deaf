import type { fetchMatch } from "./api";
import type { MatchPayload } from "./match-events";

export const formatNumberWithSign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export function getSkillLevelFromElo(elo: number): number {
  if (elo < 501) return 1;
  if (elo < 751) return 2;
  if (elo < 901) return 3;
  if (elo < 1051) return 4;
  if (elo < 1201) return 5;
  if (elo < 1351) return 6;
  if (elo < 1531) return 7;
  if (elo < 1751) return 8;
  if (elo < 2001) return 9;
  return 10;
}

export function getMatchId(payload: MatchPayload) {
  return payload.id.replace(/^1-/, "");
}

export function getPlayerIds(payload: MatchPayload) {
  return payload.teams.flatMap((team) => team.roster.map((p) => p.id));
}

export function isWingmanMatch(match: Awaited<ReturnType<typeof fetchMatch>>) {
  return (
    match.voting.location?.pick[0] === "wingman-eu" ||
    /^\d+$/.test(match.voting.map?.pick[0] ?? "")
  );
}
