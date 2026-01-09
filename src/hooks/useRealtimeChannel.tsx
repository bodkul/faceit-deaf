import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { supabaseClient } from "@/lib/supabase";

export default function useRealtimeChannel(
  queryKey: QueryKey,
  event: string = "*",
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
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
