"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const DEBOUNCE_MS = 250;

/** Query once typing pauses, not on every keystroke. */
function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function usePlayerSearch(rawQuery: string) {
  const typed = rawQuery.trim();
  const query = useDebouncedValue(typed, DEBOUNCE_MS);

  const result = useQuery({
    queryKey: ["player_search", query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const { data } = await supabase
        .from("players")
        .select("id, nickname, avatar, faceit_elo, country")
        .ilike("nickname", `%${query}%`)
        .order("faceit_elo", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: query.length >= 2,
    // Keep showing the last results while the next query is debounced.
    placeholderData: keepPreviousData,
  });

  // Before the first results arrive, report the debounce wait as loading
  // rather than as "no players found".
  const isDebouncing = typed !== query && typed.length >= 2;
  return {
    ...result,
    isLoading: result.isLoading || (isDebouncing && !result.data),
  };
}
