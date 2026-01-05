import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabaseClient } from "@/lib/supabase";

export default function useRealtimeChannel(
  queryKey: QueryKey,
  event: string = "*",
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channelName = queryKey.join(":");

    const channel = supabaseClient
      .channel(channelName)
      .on("broadcast", { event }, () => {
        queryClient.invalidateQueries({ queryKey });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, queryKey, event]);
}
