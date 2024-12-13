export type Player = {
  player_id: string;
  nickname: string;
  avatar: string | undefined;
  games: {
    cs2: {
      skill_level: number;
      faceit_elo: number;
    };
  };
  steam_id_64: number;
  faceit_url: string;
};

export type PlayerStats = {
  player_id: string;
  lifetime: {
    Matches: number;
    "Average Headshots %": number;
    "Average K/D Ratio": number;
  };
};

export type PlayerWithStats = Player & PlayerStats;
