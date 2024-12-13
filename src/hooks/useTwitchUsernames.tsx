import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

export default function useTwitchUsernames() {
  const { data } = useQuery(
    supabase
      .from("players")
      .select("twitch_username")
      .neq("twitch_username", null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return data?.map((player) => player.twitch_username) || [];
}
