import { UUID } from "crypto";

export type Database = {
  Tables: {
    players: {
      Row: {
        id: UUID;
        nickname: string;
        avatar: string | undefined;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
        steam_id_64: string;
        matches: number;
        average_headshots_percent: number;
        average_kd_ratio: number;
        twitch_username: string;
      };
      Insert: {
        id: UUID;
        nickname: string;
        avatar: string | undefined;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
        steam_id_64: string;
        matches: number;
        average_headshots_percent: number;
        average_kd_ratio: number;
      };
      Update: {
        nickname: string;
        avatar: string | undefined;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
        steam_id_64: string;
        matches: number;
        average_headshots_percent: number;
        average_kd_ratio: number;
      };
    };
    eloHistory: {
      Row: {
        player_elo: number;
        created_at: Date;
      };
      Insert: {
        player_id: UUID;
        player_elo: number;
      };
    };
    logs: {
      Row: {
        level: string;
        message: string;
        metadata: object | null;
        created_at: Date;
      };
      Insert: {
        level: string;
        message: string;
        metadata?: object | null;
      };
    };
  };
};

export type PlayerWithEloHistory = Database["Tables"]["players"]["Row"] & {
  eloHistory: Database["Tables"]["eloHistory"]["Row"][];
};
