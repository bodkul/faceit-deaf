"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime";
import type { RealtimeSource } from "@/lib/realtime/topics";

/** Drop into a server component to re-render it live. */
export function RealtimeRefresh({ sources }: { sources: RealtimeSource[] }) {
  useRealtimeRefresh(sources);
  return null;
}
