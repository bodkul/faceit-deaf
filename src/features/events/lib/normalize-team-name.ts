const TEAM_NAME_GROUPS: Record<string, string[]> = {
  Lightning: ["team_Master-"],
  "Silent Team": ["SILENT_TEAM", "SilentTeam", "team_Tuffuns"],
  "DAVI JUNIOR": ["DAVI_JUNIOR"],
  "Made in Sauna": ["MIS"],
  PrimeDeaf: ["team_Primedeaf"],
  SharkPower: ["SHARKPOWER"],
  "CUAET-D": ["team_Slavakov97", "CUEAT-D"],
  Chernihiv: ["team_Adam0v1ch"],
  DARKFANG: ["team_Honi27", "team_TK691", "team_Gumenyuk401", "team_baby_sp17"],
  "Oltenia Vanguard": ["OlteniaVanguard", "team_sNkOfficial"],
  POLARIS: ["team_Superbsrb"],
  SeaGod: ["team_X-Tricked-X"],
  STORMING: ["team_Cqpaz", "team_SomeWickBruv"],
  Astralis: ["team_GhostkilI"],
};

const TEAM_NAME_OVERRIDES: Record<string, string> = Object.fromEntries(
  Object.entries(TEAM_NAME_GROUPS).flatMap(([canonical, aliases]) =>
    aliases.map((alias) => [alias, canonical]),
  ),
);

export function normalizeTeamName(name: string | null): string {
  if (!name) {
    return "";
  }

  if (TEAM_NAME_OVERRIDES[name]) {
    return TEAM_NAME_OVERRIDES[name];
  }

  return name
    .replace(/^team_/i, "")
    .replace(/_/g, " ")
    .trim();
}

/** Matches teams whose normalized name is `teamName`, for `some`/`find`/`filter`. */
export function hasTeamName(teamName: string) {
  return (team: { team_name: string | null }) =>
    normalizeTeamName(team.team_name) === teamName;
}
