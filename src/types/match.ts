import type { useMatch } from "@/hooks/useMatch";
import type { useMatchHistory } from "@/hooks/useMatchHistory";

export type MatchType = NonNullable<ReturnType<typeof useMatch>["match"]>;

export type TeamType = MatchType["teams"][number];

export type PlayerType = TeamType["team_players"][number];

export type MatchHistoryType = NonNullable<
  ReturnType<typeof useMatchHistory>["matches"]
>[number];
