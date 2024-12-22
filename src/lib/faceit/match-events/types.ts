export interface MatchStatusEvent {
  transaction_id: string;
  event: "match_object_created" | "match_status_finished";
  event_id: string;
  third_party_id: string;
  app_id: string;
  timestamp: Date;
  retry_count: number;
  version: number;
  payload: MatchPayload;
}

export interface MatchPayload {
  id: string;
  game: string;
  entity: {
    id: string;
    name: string;
    type: string;
  };
  region: string;
  version: number;
  organizer_id: string;
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  finished_at?: Date;
  teams: {
    id: string;
    name: string;
    type: string;
    avatar: string;
    leader_id: string;
    co_leader_id: string;
    roster: {
      id: string;
      nickname: string;
      avatar: string;
      game_id: string;
      game_name: string;
      game_skill_level: number;
      membership: string;
      anticheat_required: boolean;
    }[];
    substitutions: number;
    substitutes: [];
  }[];
}
