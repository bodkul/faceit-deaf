import type { components } from "./openapi";

type Schemas = components["schemas"];

/**
 * The FACEIT spec marks every field optional and leaves some untyped
 * (`voting`, score maps). Fields the API always returns for the endpoints we
 * use are made required here.
 */
type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>;
};

type GameDetail = WithRequired<
  Schemas["GameDetail"],
  "faceit_elo" | "skill_level"
>;

export type Player = WithRequired<
  Schemas["Player"],
  "player_id" | "nickname" | "avatar" | "steam_id_64"
> & {
  games: { cs2: GameDetail };
};

type Faction = WithRequired<Schemas["Faction"], "faction_id">;

interface VotingPick {
  pick: string[];
}

export type Match = WithRequired<
  Omit<Schemas["Match"], "teams" | "results" | "voting">,
  "match_id" | "status" | "competition_id" | "organizer_id"
> & {
  teams: Record<"faction1" | "faction2", Faction>;
  results?: {
    winner?: "faction1" | "faction2";
    score: Record<"faction1" | "faction2", number>;
  };
  voting?: { location?: VotingPick; map?: VotingPick };
};

export type MatchStats = Schemas["MatchStats"];

export type PlayerStats = NonNullable<
  Schemas["PlayerStatsSimple"]["player_stats"]
>;
