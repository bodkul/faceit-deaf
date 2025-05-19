import useMatch from "@/hooks/queries/useMatch";
import useMatchHistories from "@/hooks/queries/useMatchHistories";

export type MatchType = NonNullable<ReturnType<typeof useMatch>["match"]>;

export type TeamType = MatchType["teams"][number];

export type PlayerType = TeamType["team_players"][number];

export type MatchHistoryType = NonNullable<
  ReturnType<typeof useMatchHistories>["matches"]
>[number];
