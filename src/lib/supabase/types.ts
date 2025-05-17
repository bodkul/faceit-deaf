export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PlayerStats = {
  Assists: string;
  "Best Of": string;
  "Competition Id": string;
  "Created At": string;
  Deaths: string;
  "Final Score": string;
  "First Half Score": string;
  Game: string;
  "Game Mode": string;
  Headshots: string;
  "Headshots %": string;
  "K/D Ratio": string;
  "K/R Ratio": string;
  Kills: string;
  MVPs: string;
  Map: string;
  "Match Id": string;
  "Match Round": string;
  Nickname: string;
  "Overtime score": string;
  "Penta Kills": string;
  "Player Id": string;
  "Quadro Kills": string;
  Region: string;
  Result: string;
  Rounds: string;
  Score: string;
  "Second Half Score": string;
  Team: string;
  "Triple Kills": string;
  "Updated At": string;
  Winner: string;
  ADR: string;
  "Match Finished At": number;
};

export type Database = {
  public: {
    Tables: {
      eloHistory: {
        Row: {
          created_at: string;
          id: string;
          player_elo: number;
          player_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          player_elo: number;
          player_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          player_elo?: number;
          player_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "eloHistory_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      match_team_players: {
        Row: {
          avatar: string | null;
          elo_after: number | null;
          elo_before: number | null;
          game_skill_level: number | null;
          id: string;
          match_team_id: string;
          nickname: string;
          player_id_mandatory: string;
          player_id_nullable: string | null;
          player_stats: PlayerStats | null;
        };
        Insert: {
          avatar?: string | null;
          elo_after?: number | null;
          elo_before?: number | null;
          game_skill_level?: number | null;
          id?: string;
          match_team_id: string;
          nickname: string;
          player_id_mandatory: string;
          player_id_nullable?: string | null;
          player_stats?: PlayerStats | null;
        };
        Update: {
          avatar?: string | null;
          elo_after?: number | null;
          elo_before?: number | null;
          game_skill_level?: number | null;
          id?: string;
          match_team_id?: string;
          nickname?: string;
          player_id_mandatory?: string;
          player_id_nullable?: string | null;
          player_stats?: PlayerStats | null;
        };
        Relationships: [
          {
            foreignKeyName: "match_team_players_match_team_id_fkey";
            columns: ["match_team_id"];
            isOneToOne: false;
            referencedRelation: "match_teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_team_players_player_id_nullable_fkey";
            columns: ["player_id_nullable"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      match_teams: {
        Row: {
          avatar: string | null;
          faction: number | null;
          final_score: number | null;
          first_half_score: number | null;
          id: string;
          match_id: string;
          name: string;
          overtime_score: number | null;
          second_half_score: number | null;
          team_id: string;
          team_win: boolean | null;
        };
        Insert: {
          avatar?: string | null;
          faction?: number | null;
          final_score?: number | null;
          first_half_score?: number | null;
          id?: string;
          match_id: string;
          name: string;
          overtime_score?: number | null;
          second_half_score?: number | null;
          team_id: string;
          team_win?: boolean | null;
        };
        Update: {
          avatar?: string | null;
          faction?: number | null;
          final_score?: number | null;
          first_half_score?: number | null;
          id?: string;
          match_id?: string;
          name?: string;
          overtime_score?: number | null;
          second_half_score?: number | null;
          team_id?: string;
          team_win?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "match_teams_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          competition_id: string;
          finished_at: string | null;
          id: string;
          location_pick: string | null;
          map_pick: string | null;
          organizer_id: string;
          round_score: string | null;
          started_at: string | null;
          status: string | null;
        };
        Insert: {
          competition_id: string;
          finished_at?: string | null;
          id: string;
          location_pick?: string | null;
          map_pick?: string | null;
          organizer_id: string;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
        };
        Update: {
          competition_id?: string;
          finished_at?: string | null;
          id?: string;
          location_pick?: string | null;
          map_pick?: string | null;
          organizer_id?: string;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          avatar: string;
          country: string | null;
          cover_image: string | null;
          created_at: string;
          faceit_elo: number;
          id: string;
          nickname: string;
          skill_level: number;
          steam_id_64: string;
          twitch_username: string | null;
        };
        Insert: {
          avatar: string;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string;
          faceit_elo: number;
          id: string;
          nickname: string;
          skill_level: number;
          steam_id_64: string;
          twitch_username?: string | null;
        };
        Update: {
          avatar?: string;
          country?: string | null;
          cover_image?: string | null;
          created_at?: string;
          faceit_elo?: number;
          id?: string;
          nickname?: string;
          skill_level?: number;
          steam_id_64?: string;
          twitch_username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_map_picks_count: {
        Args: Record<PropertyKey, never>;
        Returns: {
          map_pick: string;
          count: number;
        }[];
      };
      get_player_stats: {
        Args: { player_id: string };
        Returns: {
          id: string;
          kills: string;
          deaths: string;
          headshots: string;
          kpr: string;
          adr: string;
          assists: string;
          rounds: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
