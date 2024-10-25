import { UUID } from "crypto";

export type Player = {
  player_id: UUID;
  nickname: string;
  avatar: string | undefined;
  games: {
    cs2: {
      skill_level: number;
      faceit_elo: number;
    };
  };
  steam_id_64: string;
  faceit_url: string;
};

export type PlayerStats = {
  player_id: UUID;
  lifetime: {
    Matches: number;
    "Average Headshots %": number;
    "Average K/D Ratio": number;
  };
};

export type PlayerWithStats = Player & PlayerStats;
