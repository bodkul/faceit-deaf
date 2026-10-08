import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { subscribe } from "@/lib/realtime/subscribe";
import type { RealtimeSource } from "@/lib/realtime/topics";

// A single sync writes many rows; collapse the burst into one refetch.
const DEBOUNCE_MS = 300;

function useRealtimeEffect(sources: RealtimeSource[], onChange: () => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  // Callers pass fresh array literals; depend on their content instead.
  const sourcesKey = JSON.stringify(sources);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onChangeRef.current(), DEBOUNCE_MS);
    };

    const unsubscribers = (JSON.parse(sourcesKey) as RealtimeSource[]).map(
      (source) => subscribe(source, debounced),
    );

    return () => {
      clearTimeout(timer);
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  }, [sourcesKey]);
}

/** Refetches queries under `queryKey` whenever any of `sources` changes. */
export function useRealtime(queryKey: QueryKey, sources: RealtimeSource[]) {
  const queryClient = useQueryClient();

  useRealtimeEffect(sources, () => {
    queryClient.invalidateQueries({ queryKey });
  });
}

/** Re-renders the current server components whenever `sources` change. */
export function useRealtimeRefresh(sources: RealtimeSource[]) {
  const router = useRouter();

  useRealtimeEffect(sources, () => router.refresh());
}
