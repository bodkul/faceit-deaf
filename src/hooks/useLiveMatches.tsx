"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase";

export function useLiveMatches() {
  const { mutate, ...query } = useQuery(
    supabase
      .from("live_matches")
      .select()
      .order("status", { ascending: false })
      .order("started_at", { ascending: false }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    channelRef.current = supabase.channel("live-matches");

    channelRef.current
      .on("broadcast", { event: "*" }, () => mutate().then())
      .subscribe();

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [mutate]);

  return query;
}
