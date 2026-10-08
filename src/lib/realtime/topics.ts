import type { Database } from "@/types/database";

/** Broadcast topics, sent by server code after it finishes writing. */
export const topics = {
  liveMatches: "live-matches",
  players: "players",
  match: (matchId: string) => `match:${matchId}`,
  player: (playerId: string) => `player:${playerId}`,
};

type TableName = keyof Database["public"]["Tables"];

/**
 * A broadcast topic, or a table watched with Postgres Changes — for data
 * written outside this app (events), which can't broadcast after writing.
 */
export type RealtimeSource = string | { table: TableName; filter?: string };

/** Event tables are synced externally; any change refreshes event views. */
export const eventSources: RealtimeSource[] = [
  { table: "events" },
  { table: "event_matches" },
  { table: "event_match_teams" },
  { table: "event_match_maps" },
  { table: "event_map_team_stats" },
  { table: "event_map_player_stats" },
];
