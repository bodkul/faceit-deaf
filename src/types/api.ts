export type Player = {
  player_id: string;
  nickname: string;
  avatar: string;
  games: {
    cs2: {
      skill_level: number;
      faceit_elo: number;
    };
  };
  steam_id_64: number;
  faceit_url: string;
};
