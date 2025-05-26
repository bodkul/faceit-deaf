import type { usePlayersWithPagination } from "@/hooks/usePlayers";
import type { getPlayerByUsername } from "@/lib/supabase/players";

export type PlayerWithPagination = NonNullable<
  ReturnType<typeof usePlayersWithPagination>["data"]
>[number];

export type PlayerByUsername = NonNullable<
  Awaited<ReturnType<typeof getPlayerByUsername>>
>;
