/** Columns a home-page match card needs, shared by the live and finished lists. */
export const MATCH_CARD_COLUMNS =
  "id, status, map_pick, round_score, started_at, finished_at, match_teams(match_team_players(nickname, player_id_nullable))";

type MatchCardRow = {
  match_teams: {
    match_team_players: {
      nickname: string;
      player_id_nullable: string | null;
    }[];
  }[];
};

/** Flattens the teams into the nicknames of tracked players. */
export function withTrackedPlayers<T extends MatchCardRow>(rows: T[]) {
  return rows.map(({ match_teams, ...match }) => ({
    ...match,
    // Only tracked (deaf) players have player_id_nullable set.
    players: match_teams.flatMap((team) =>
      team.match_team_players
        .filter((p) => p.player_id_nullable)
        .map((p) => p.nickname),
    ),
  }));
}
