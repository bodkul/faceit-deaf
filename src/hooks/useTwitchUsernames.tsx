import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabaseClient";

export default function useTwitchUsernames() {
  const { data } = useQuery(
    supabase
      .from("players")
      .select("twitch_username")
      .neq("twitch_username", null)
      .returns<{ twitch_username: string }[]>(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return data?.map((player) => player.twitch_username) || [];
}
