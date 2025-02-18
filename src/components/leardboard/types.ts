export interface PlayerWithEloHistory {
  id: string;
  nickname: string;
  avatar: string;
  skill_level: number;
  faceit_elo: number;
  eloHistory: { player_elo: number }[];
}
