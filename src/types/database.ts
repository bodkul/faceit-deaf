import { UUID } from "crypto";

export type Database = {
  Tables: {
    players: {
      Row: {
        id: UUID;
        nickname: string;
        avatar: string | null;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
      Insert: {
        id: UUID;
        nickname: string;
        avatar: string | null;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
      Update: {
        nickname: string;
        avatar: string | null;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
    };
  };
};
