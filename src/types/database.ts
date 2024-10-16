export type Database = {
  Tables: {
    players: {
      Row: {
        id: string;
        nickname: string;
        avatar: string;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
      Insert: {
        id: string;
        nickname: string;
        avatar: string;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
      Update: {
        nickname: string;
        avatar: string;
        skill_level: number;
        faceit_elo: number;
        faceit_url: string;
      };
    };
  };
};
