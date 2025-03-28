import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabase";

export default function useTwitchUsernames() {
  const { data } = useQuery(
    supabase
      .from("players")
      .select("twitch_username")
      .neq("twitch_username", null)
      .returns<{ twitch_username: string }[]>(),
  );

  return data?.map((player) => player.twitch_username) || [];
}
