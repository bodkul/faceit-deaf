export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
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
          anticheat_required: boolean | null;
          avatar: string | null;
          game_player_id: string | null;
          game_player_name: string | null;
          game_skill_level: number | null;
          id: string;
          match_team_id: string;
          membership: string | null;
          nickname: string;
          player_id_mandatory: string;
          player_id_nullable: string | null;
          player_stats: Json | null;
        };
        Insert: {
          anticheat_required?: boolean | null;
          avatar?: string | null;
          game_player_id?: string | null;
          game_player_name?: string | null;
          game_skill_level?: number | null;
          id?: string;
          match_team_id: string;
          membership?: string | null;
          nickname: string;
          player_id_mandatory: string;
          player_id_nullable?: string | null;
          player_stats?: Json | null;
        };
        Update: {
          anticheat_required?: boolean | null;
          avatar?: string | null;
          game_player_id?: string | null;
          game_player_name?: string | null;
          game_skill_level?: number | null;
          id?: string;
          match_team_id?: string;
          membership?: string | null;
          nickname?: string;
          player_id_mandatory?: string;
          player_id_nullable?: string | null;
          player_stats?: Json | null;
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
          final_score: number | null;
          first_half_score: number | null;
          id: string;
          leader: string;
          match_id: string;
          name: string;
          overtime_score: number | null;
          second_half_score: number | null;
          team_headshots: number | null;
          team_id: string;
          team_win: boolean | null;
        };
        Insert: {
          avatar?: string | null;
          final_score?: number | null;
          first_half_score?: number | null;
          id?: string;
          leader: string;
          match_id: string;
          name: string;
          overtime_score?: number | null;
          second_half_score?: number | null;
          team_headshots?: number | null;
          team_id: string;
          team_win?: boolean | null;
        };
        Update: {
          avatar?: string | null;
          final_score?: number | null;
          first_half_score?: number | null;
          id?: string;
          leader?: string;
          match_id?: string;
          name?: string;
          overtime_score?: number | null;
          second_half_score?: number | null;
          team_headshots?: number | null;
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
          best_of: number | null;
          chat_room_id: string | null;
          competition_id: string;
          configured_at: string | null;
          demo_url: string | null;
          faceit_url: string | null;
          finished_at: string | null;
          game: string;
          id: string;
          location_pick: string | null;
          map_pick: string | null;
          organizer_id: string;
          region: string;
          round_score: string | null;
          started_at: string | null;
          status: string | null;
          winner_team_id: string | null;
        };
        Insert: {
          best_of?: number | null;
          chat_room_id?: string | null;
          competition_id: string;
          configured_at?: string | null;
          demo_url?: string | null;
          faceit_url?: string | null;
          finished_at?: string | null;
          game: string;
          id: string;
          location_pick?: string | null;
          map_pick?: string | null;
          organizer_id: string;
          region: string;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
          winner_team_id?: string | null;
        };
        Update: {
          best_of?: number | null;
          chat_room_id?: string | null;
          competition_id?: string;
          configured_at?: string | null;
          demo_url?: string | null;
          faceit_url?: string | null;
          finished_at?: string | null;
          game?: string;
          id?: string;
          location_pick?: string | null;
          map_pick?: string | null;
          organizer_id?: string;
          region?: string;
          round_score?: string | null;
          started_at?: string | null;
          status?: string | null;
          winner_team_id?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          avatar: string;
          created_at: string;
          faceit_elo: number;
          faceit_url: string;
          id: string;
          nickname: string;
          skill_level: number;
          steam_id_64: string;
          twitch_username: string | null;
        };
        Insert: {
          avatar: string;
          created_at?: string;
          faceit_elo: number;
          faceit_url: string;
          id: string;
          nickname: string;
          skill_level: number;
          steam_id_64: string;
          twitch_username?: string | null;
        };
        Update: {
          avatar?: string;
          created_at?: string;
          faceit_elo?: number;
          faceit_url?: string;
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
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
