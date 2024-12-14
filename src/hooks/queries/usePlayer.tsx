import { useQuery } from "@supabase-cache-helpers/postgrest-swr";

import { supabase } from "@/lib/supabaseClient";

export default function usePlayer(username: string) {
  return useQuery(
    supabase.from("players").select().eq("nickname", username).single(),
  );
}
