export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
      player_stats_normalized: {
        Row: {
          "1v1count": string | null;
          "1v1wins": string | null;
          "1v2count": string | null;
          "1v2wins": string | null;
          adr: string | null;
          assists: string | null;
          clutch_kills: string | null;
          damage: string | null;
          deaths: string | null;
          double_kills: string | null;
          enemies_flashed: string | null;
          enemies_flashed_per_round_in_a_match: string | null;
          entry_count: string | null;
          entry_wins: string | null;
          first_kills: string | null;
          flash_count: string | null;
          flash_success_rate_per_match: string | null;
          flash_successes: string | null;
          flashes_per_round_in_a_match: string | null;
          headshots: string | null;
          headshots_percent: string | null;
          kd_ratio: string | null;
          kr_ratio: string | null;
          kills: string | null;
          knife_kills: string | null;
          match_1v1_win_rate: string | null;
          match_1v2_win_rate: string | null;
          match_entry_rate: string | null;
          match_entry_success_rate: string | null;
          match_team_player_id: string;
          mvps: string | null;
          penta_kills: string | null;
          pistol_kills: string | null;
          quadro_kills: string | null;
          sniper_kill_rate_per_match: string | null;
          sniper_kill_rate_per_round: string | null;
          sniper_kills: string | null;
          triple_kills: string | null;
          utility_count: string | null;
          utility_damage: string | null;
          utility_damage_per_round_in_a_match: string | null;
          utility_damage_success_rate_per_match: string | null;
          utility_enemies: string | null;
          utility_success_rate_per_match: string | null;
          utility_successes: string | null;
          utility_usage_per_round: string | null;
          zeus_kills: string | null;
        };
        Insert: {
          "1v1count"?: string | null;
          "1v1wins"?: string | null;
          "1v2count"?: string | null;
          "1v2wins"?: string | null;
          adr?: string | null;
          assists?: string | null;
          clutch_kills?: string | null;
          damage?: string | null;
          deaths?: string | null;
          double_kills?: string | null;
          enemies_flashed?: string | null;
          enemies_flashed_per_round_in_a_match?: string | null;
          entry_count?: string | null;
          entry_wins?: string | null;
          first_kills?: string | null;
          flash_count?: string | null;
          flash_success_rate_per_match?: string | null;
          flash_successes?: string | null;
          flashes_per_round_in_a_match?: string | null;
          headshots?: string | null;
          headshots_percent?: string | null;
          kd_ratio?: string | null;
          kr_ratio?: string | null;
          kills?: string | null;
          knife_kills?: string | null;
          match_1v1_win_rate?: string | null;
          match_1v2_win_rate?: string | null;
          match_entry_rate?: string | null;
          match_entry_success_rate?: string | null;
          match_team_player_id: string;
          mvps?: string | null;
          penta_kills?: string | null;
          pistol_kills?: string | null;
          quadro_kills?: string | null;
          sniper_kill_rate_per_match?: string | null;
          sniper_kill_rate_per_round?: string | null;
          sniper_kills?: string | null;
          triple_kills?: string | null;
          utility_count?: string | null;
          utility_damage?: string | null;
          utility_damage_per_round_in_a_match?: string | null;
          utility_damage_success_rate_per_match?: string | null;
          utility_enemies?: string | null;
          utility_success_rate_per_match?: string | null;
          utility_successes?: string | null;
          utility_usage_per_round?: string | null;
          zeus_kills?: string | null;
        };
        Update: {
          "1v1count"?: string | null;
          "1v1wins"?: string | null;
          "1v2count"?: string | null;
          "1v2wins"?: string | null;
          adr?: string | null;
          assists?: string | null;
          clutch_kills?: string | null;
          damage?: string | null;
          deaths?: string | null;
          double_kills?: string | null;
          enemies_flashed?: string | null;
          enemies_flashed_per_round_in_a_match?: string | null;
          entry_count?: string | null;
          entry_wins?: string | null;
          first_kills?: string | null;
          flash_count?: string | null;
          flash_success_rate_per_match?: string | null;
          flash_successes?: string | null;
          flashes_per_round_in_a_match?: string | null;
          headshots?: string | null;
          headshots_percent?: string | null;
          kd_ratio?: string | null;
          kr_ratio?: string | null;
          kills?: string | null;
          knife_kills?: string | null;
          match_1v1_win_rate?: string | null;
          match_1v2_win_rate?: string | null;
          match_entry_rate?: string | null;
          match_entry_success_rate?: string | null;
          match_team_player_id?: string;
          mvps?: string | null;
          penta_kills?: string | null;
          pistol_kills?: string | null;
          quadro_kills?: string | null;
          sniper_kill_rate_per_match?: string | null;
          sniper_kill_rate_per_round?: string | null;
          sniper_kills?: string | null;
          triple_kills?: string | null;
          utility_count?: string | null;
          utility_damage?: string | null;
          utility_damage_per_round_in_a_match?: string | null;
          utility_damage_success_rate_per_match?: string | null;
          utility_enemies?: string | null;
          utility_success_rate_per_match?: string | null;
          utility_successes?: string | null;
          utility_usage_per_round?: string | null;
          zeus_kills?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_stats_normalized_match_team_player_id_fkey";
            columns: ["match_team_player_id"];
            isOneToOne: true;
            referencedRelation: "match_team_players";
            referencedColumns: ["id"];
          },
        ];
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
