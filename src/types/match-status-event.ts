interface EventEntity {
  id: string;
  name: string;
  type: string;
}

interface Player {
  id: string;
  nickname: string;
  avatar: string;
  game_id: string;
  game_name: string;
  game_skill_level: number;
  membership: string;
  anticheat_required: boolean;
}

interface Team {
  id: string;
  name: string;
  type: string;
  avatar: string;
  leader_id: string;
  co_leader_id: string;
  roster: Player[];
  substitutions: number;
  substitutes: [];
}

export interface Payload {
  id: string;
  organizer_id: string;
  region: string;
  game: string;
  version: number;
  entity: EventEntity;
  teams: Team[];
  created_at: Date;
  updated_at: Date;
  started_at: Date;
  finished_at: Date;
}

export interface MatchStatusEvent {
  transaction_id: string;
  event: string;
  event_id: string;
  third_party_id: string;
  app_id: string;
  timestamp: Date;
  retry_count: number;
  version: number;
  payload: Payload;
}
