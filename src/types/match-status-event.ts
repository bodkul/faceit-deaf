import { UUID } from "crypto";

interface EventEntity {
  id: UUID;
  name: string;
  type: string;
}

interface Player {
  id: UUID;
  nickname: string;
  avatar: string;
  game_id: string;
  game_name: string;
  game_skill_level: number;
  membership: string;
  anticheat_required: boolean;
}

interface Team {
  id: UUID;
  name: string;
  type: string;
  avatar: string;
  leader_id: UUID;
  co_leader_id: string;
  roster: Player[];
  substitutions: number;
  substitutes: [];
}

export interface Payload {
  id: UUID;
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
  transaction_id: UUID;
  event: string;
  event_id: UUID;
  third_party_id: UUID;
  app_id: UUID;
  timestamp: Date;
  retry_count: number;
  version: number;
  payload: Payload;
}
