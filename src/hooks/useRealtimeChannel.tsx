import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { supabaseClient } from "@/lib/supabase";

/**
 * Invalidates `queryKey` whenever a broadcast arrives on the channel named
 * `queryKey.join(":")` (e.g. ["match", id] → "match:<id>").
 */
export default function useRealtimeChannel(
  queryKey: QueryKey,
  event: string = "*",
) {
  const queryClient = useQueryClient();
  // Callers usually pass a fresh array literal on every render, so depend on
  // the channel name instead of the array identity to avoid resubscribing.
  const channelName = queryKey.join(":");
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  useEffect(() => {
    const channel = supabaseClient
      .channel(channelName)
      .on("broadcast", { event }, () => {
        queryClient.invalidateQueries({ queryKey: queryKeyRef.current });
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [queryClient, channelName, event]);
}
