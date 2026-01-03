"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { supabaseClient } from "@/lib/supabase";

export function useLiveMatches() {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabaseClient.channel("live-matches");

    channelRef.current
      .on("broadcast", { event: "*" }, () => {
        queryClient.invalidateQueries({ queryKey: ["live-matches"] });
      })
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["live-matches"],
    queryFn: async () => {
      const { data } = await supabaseClient
        .from("live_matches")
        .select("*")
        .order("status", { ascending: false })
        .order("started_at", { ascending: false });
      return data;
    },
  });
}
