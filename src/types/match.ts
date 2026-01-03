import type { useMatch } from "@/hooks/useMatch";
import type { useMatchHistory } from "@/hooks/useMatchHistory";
import type { useRecentMatches } from "@/hooks/useRecentMatches";

export type MatchType = NonNullable<ReturnType<typeof useMatch>["data"]>;

export type TeamType = MatchType["teams"][number];

export type PlayerType = TeamType["team_players"][number];

export type MatchHistoryType = NonNullable<
  ReturnType<typeof useMatchHistory>["data"]
>[number];

export type RecentMatchType = NonNullable<
  ReturnType<typeof useRecentMatches>["data"]
>[number];
