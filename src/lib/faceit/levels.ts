/** Lowest ELO of each FACEIT CS2 skill level (index = level - 1). */
const LEVEL_MIN_ELO = [100, 501, 751, 901, 1051, 1201, 1351, 1531, 1751, 2001];

export function getSkillLevel(elo: number | null | undefined): number {
  if (!elo) return 0;
  let level = 1;
  for (const [index, min] of LEVEL_MIN_ELO.entries()) {
    if (elo >= min) level = index + 1;
  }
  return level;
}

/** ELO missing to reach the next level, or null at level 10. */
export function getEloToNextLevel(elo: number | null | undefined) {
  const level = getSkillLevel(elo);
  if (!elo || level >= 10) return null;
  return LEVEL_MIN_ELO[level] - elo;
}
