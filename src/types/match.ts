import useMatch from "@/hooks/queries/useMatch";

export type MatchType = NonNullable<ReturnType<typeof useMatch>["match"]>;
export type TeamType = MatchType["teams"][number];
export type PlayerType = TeamType["team_players"][number];
