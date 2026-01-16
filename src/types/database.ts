export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  next_auth: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null;
          expires_at: number | null;
          id: string;
          id_token: string | null;
          oauth_token: string | null;
          oauth_token_secret: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          scope: string | null;
          session_state: string | null;
          token_type: string | null;
          type: string;
          userId: string | null;
        };
        Insert: {
          access_token?: string | null;
          expires_at?: number | null;
          id?: string;
          id_token?: string | null;
          oauth_token?: string | null;
          oauth_token_secret?: string | null;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type: string;
          userId?: string | null;
        };
        Update: {
          access_token?: string | null;
          expires_at?: number | null;
          id?: string;
          id_token?: string | null;
          oauth_token?: string | null;
          oauth_token_secret?: string | null;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          scope?: string | null;
          session_state?: string | null;
          token_type?: string | null;
          type?: string;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sessions: {
        Row: {
          expires: string;
          id: string;
          sessionToken: string;
          userId: string | null;
        };
        Insert: {
          expires: string;
          id?: string;
          sessionToken: string;
          userId?: string | null;
        };
        Update: {
          expires?: string;
          id?: string;
          sessionToken?: string;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          email: string | null;
          emailVerified: string | null;
          id: string;
          image: string | null;
          name: string | null;
        };
        Insert: {
          email?: string | null;
          emailVerified?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
        };
        Update: {
          email?: string | null;
          emailVerified?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
      verification_tokens: {
        Row: {
          expires: string;
          identifier: string | null;
          token: string;
        };
        Insert: {
          expires: string;
          identifier?: string | null;
          token: string;
        };
        Update: {
          expires?: string;
          identifier?: string | null;
          token?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      uid: { Args: never; Returns: string };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      event_teams: {
        Row: {
          event_id: string;
          id: string;
          team_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          team_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_teams_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_teams_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          avatar: string;
          created_at: string;
          end_date: string;
          id: string;
          location: string;
          name: string;
          start_date: string;
        };
        Insert: {
          avatar: string;
          created_at?: string;
          end_date: string;
          id?: string;
          location: string;
          name: string;
          start_date: string;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          end_date?: string;
          id?: string;
          location?: string;
          name?: string;
          start_date?: string;
        };
        Relationships: [];
      };
      match_team_players: {
        Row: {
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
            referencedRelation: "leaderboard_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_team_players_player_id_nullable_fkey";
            columns: ["player_id_nullable"];
            isOneToOne: false;
            referencedRelation: "player_card_data";
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
            referencedRelation: "live_matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_teams_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_teams_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "player_matches";
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
          "1v1count": number | null;
          "1v1wins": number | null;
          "1v2count": number | null;
          "1v2wins": number | null;
          adr: number | null;
          assists: number | null;
          clutch_kills: number | null;
          damage: number | null;
          deaths: number | null;
          double_kills: number | null;
          enemies_flashed: number | null;
          enemies_flashed_per_round_in_a_match: number | null;
          entry_count: number | null;
          entry_wins: number | null;
          first_kills: number | null;
          flash_count: number | null;
          flash_success_rate_per_match: number | null;
          flash_successes: number | null;
          flashes_per_round_in_a_match: number | null;
          headshots: number | null;
          headshots_percent: number | null;
          kd_ratio: number | null;
          kills: number | null;
          knife_kills: number | null;
          kr_ratio: number | null;
          match_1v1_win_rate: number | null;
          match_1v2_win_rate: number | null;
          match_entry_rate: number | null;
          match_entry_success_rate: number | null;
          match_team_player_id: string;
          mvps: number | null;
          penta_kills: number | null;
          pistol_kills: number | null;
          quadro_kills: number | null;
          sniper_kill_rate_per_match: number | null;
          sniper_kill_rate_per_round: number | null;
          sniper_kills: number | null;
          triple_kills: number | null;
          utility_count: number | null;
          utility_damage: number | null;
          utility_damage_per_round_in_a_match: number | null;
          utility_damage_success_rate_per_match: number | null;
          utility_enemies: number | null;
          utility_success_rate_per_match: number | null;
          utility_successes: number | null;
          utility_usage_per_round: number | null;
          zeus_kills: number | null;
        };
        Insert: {
          "1v1count"?: number | null;
          "1v1wins"?: number | null;
          "1v2count"?: number | null;
          "1v2wins"?: number | null;
          adr?: number | null;
          assists?: number | null;
          clutch_kills?: number | null;
          damage?: number | null;
          deaths?: number | null;
          double_kills?: number | null;
          enemies_flashed?: number | null;
          enemies_flashed_per_round_in_a_match?: number | null;
          entry_count?: number | null;
          entry_wins?: number | null;
          first_kills?: number | null;
          flash_count?: number | null;
          flash_success_rate_per_match?: number | null;
          flash_successes?: number | null;
          flashes_per_round_in_a_match?: number | null;
          headshots?: number | null;
          headshots_percent?: number | null;
          kd_ratio?: number | null;
          kills?: number | null;
          knife_kills?: number | null;
          kr_ratio?: number | null;
          match_1v1_win_rate?: number | null;
          match_1v2_win_rate?: number | null;
          match_entry_rate?: number | null;
          match_entry_success_rate?: number | null;
          match_team_player_id: string;
          mvps?: number | null;
          penta_kills?: number | null;
          pistol_kills?: number | null;
          quadro_kills?: number | null;
          sniper_kill_rate_per_match?: number | null;
          sniper_kill_rate_per_round?: number | null;
          sniper_kills?: number | null;
          triple_kills?: number | null;
          utility_count?: number | null;
          utility_damage?: number | null;
          utility_damage_per_round_in_a_match?: number | null;
          utility_damage_success_rate_per_match?: number | null;
          utility_enemies?: number | null;
          utility_success_rate_per_match?: number | null;
          utility_successes?: number | null;
          utility_usage_per_round?: number | null;
          zeus_kills?: number | null;
        };
        Update: {
          "1v1count"?: number | null;
          "1v1wins"?: number | null;
          "1v2count"?: number | null;
          "1v2wins"?: number | null;
          adr?: number | null;
          assists?: number | null;
          clutch_kills?: number | null;
          damage?: number | null;
          deaths?: number | null;
          double_kills?: number | null;
          enemies_flashed?: number | null;
          enemies_flashed_per_round_in_a_match?: number | null;
          entry_count?: number | null;
          entry_wins?: number | null;
          first_kills?: number | null;
          flash_count?: number | null;
          flash_success_rate_per_match?: number | null;
          flash_successes?: number | null;
          flashes_per_round_in_a_match?: number | null;
          headshots?: number | null;
          headshots_percent?: number | null;
          kd_ratio?: number | null;
          kills?: number | null;
          knife_kills?: number | null;
          kr_ratio?: number | null;
          match_1v1_win_rate?: number | null;
          match_1v2_win_rate?: number | null;
          match_entry_rate?: number | null;
          match_entry_success_rate?: number | null;
          match_team_player_id?: string;
          mvps?: number | null;
          penta_kills?: number | null;
          pistol_kills?: number | null;
          quadro_kills?: number | null;
          sniper_kill_rate_per_match?: number | null;
          sniper_kill_rate_per_round?: number | null;
          sniper_kills?: number | null;
          triple_kills?: number | null;
          utility_count?: number | null;
          utility_damage?: number | null;
          utility_damage_per_round_in_a_match?: number | null;
          utility_damage_success_rate_per_match?: number | null;
          utility_enemies?: number | null;
          utility_success_rate_per_match?: number | null;
          utility_successes?: number | null;
          utility_usage_per_round?: number | null;
          zeus_kills?: number | null;
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
      teams: {
        Row: {
          avatar: string | null;
          country: string | null;
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          avatar?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          name: string;
        };
        Update: {
          avatar?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          email: string | null;
          id: string;
          image: string | null;
          name: string | null;
          player_id: string | null;
        };
        Insert: {
          email?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          player_id?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          player_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      hypopg_hidden_indexes: {
        Row: {
          am_name: unknown;
          index_name: unknown;
          indexrelid: unknown;
          is_hypo: boolean | null;
          schema_name: unknown;
          table_name: unknown;
        };
        Relationships: [];
      };
      hypopg_list_indexes: {
        Row: {
          am_name: unknown;
          index_name: string | null;
          indexrelid: unknown;
          schema_name: unknown;
          table_name: unknown;
        };
        Relationships: [];
      };
      leaderboard_players: {
        Row: {
          avatar: string | null;
          country: string | null;
          elo_before: number | null;
          faceit_elo: number | null;
          id: string | null;
          nickname: string | null;
          skill_level: number | null;
        };
        Relationships: [];
      };
      live_matches: {
        Row: {
          finished_at: string | null;
          id: string | null;
          map_pick: string | null;
          players: string[] | null;
          round_score: string | null;
          started_at: string | null;
          status: string | null;
        };
        Insert: {
          finished_at?: string | null;
          id?: string | null;
          map_pick?: string | null;
          players?: never;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
        };
        Update: {
          finished_at?: string | null;
          id?: string | null;
          map_pick?: string | null;
          players?: never;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
        };
        Relationships: [];
      };
      player_card_data: {
        Row: {
          avatar: string | null;
          country: string | null;
          faceit_elo: number | null;
          id: string | null;
          match_count: number | null;
          most_played_map: string | null;
          nickname: string | null;
          skill_level: number | null;
          win_count: number | null;
          winrate: number | null;
        };
        Relationships: [];
      };
      player_matches: {
        Row: {
          adr: number | null;
          deaths: number | null;
          elo_diff: number | null;
          finished_at: string | null;
          headshots: number | null;
          id: string | null;
          kills: number | null;
          kr_ratio: number | null;
          map: string | null;
          player_id: string | null;
          round_score: string | null;
          win: boolean | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_map_picks_count: {
        Args: never;
        Returns: {
          count: number;
          map_pick: string;
        }[];
      };
      hypopg: { Args: never; Returns: Record<string, unknown>[] };
      hypopg_create_index: {
        Args: { sql_order: string };
        Returns: Record<string, unknown>[];
      };
      hypopg_drop_index: { Args: { indexid: unknown }; Returns: boolean };
      hypopg_get_indexdef: { Args: { indexid: unknown }; Returns: string };
      hypopg_hidden_indexes: {
        Args: never;
        Returns: {
          indexid: unknown;
        }[];
      };
      hypopg_hide_index: { Args: { indexid: unknown }; Returns: boolean };
      hypopg_relation_size: { Args: { indexid: unknown }; Returns: number };
      hypopg_reset: { Args: never; Returns: undefined };
      hypopg_reset_index: { Args: never; Returns: undefined };
      hypopg_unhide_all_indexes: { Args: never; Returns: undefined };
      hypopg_unhide_index: { Args: { indexid: unknown }; Returns: boolean };
      index_advisor: {
        Args: { query: string };
        Returns: {
          errors: string[];
          index_statements: string[];
          startup_cost_after: Json;
          startup_cost_before: Json;
          total_cost_after: Json;
          total_cost_before: Json;
        }[];
      };
      update_live_matches_if_any: { Args: never; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  next_auth: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
