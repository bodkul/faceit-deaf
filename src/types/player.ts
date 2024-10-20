import { UUID } from "crypto";

export type Player = {
  player_id: UUID;
  nickname: string;
  avatar: string | null;
  games: {
    cs2: {
      skill_level: number;
      faceit_elo: number;
    };
  };
  faceit_url: string;
};
