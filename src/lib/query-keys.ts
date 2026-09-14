export const queryKeys = {
  events: {
    all: ["events"] as const,
    detail: (slug: string) => ["events", slug] as const,
    matches: (eventId: string) => ["event", eventId, "matches"] as const,
    teams: (eventId: string) => ["event", eventId, "teams"] as const,
    players: (eventId: string) => ["event", eventId, "players"] as const,
  },
  matches: {
    detail: (matchId: string) => ["match", matchId] as const,
  },
};
