import type { RealtimeChannel } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

import type { RealtimeSource } from "./topics";

const supabase = createClient();

// Keeps a channel alive briefly after its last listener leaves, so StrictMode
// remounts and tab switches reuse it instead of resubscribing.
const TEARDOWN_DELAY_MS = 1000;

type Entry = {
  channel: RealtimeChannel;
  listeners: Set<() => void>;
  teardown?: ReturnType<typeof setTimeout>;
};

// supabase.channel() returns the existing channel for a topic, so hooks that
// watch the same source must share one subscription.
const entries = new Map<string, Entry>();

function channelName(source: RealtimeSource) {
  return typeof source === "string"
    ? source
    : `db:${source.table}:${source.filter ?? "*"}`;
}

function openChannel(name: string, source: RealtimeSource, notify: () => void) {
  const channel = supabase.channel(name);

  if (typeof source === "string") {
    channel.on("broadcast", { event: "*" }, notify);
  } else {
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: source.table,
        filter: source.filter,
      },
      notify,
    );
  }

  return channel.subscribe();
}

/** Calls `listener` on every change of `source`; returns an unsubscribe. */
export function subscribe(source: RealtimeSource, listener: () => void) {
  const name = channelName(source);
  let entry = entries.get(name);

  if (!entry) {
    const listeners = new Set<() => void>();
    const channel = openChannel(name, source, () => {
      for (const notify of listeners) notify();
    });
    entry = { channel, listeners };
    entries.set(name, entry);
  }

  const current = entry;
  clearTimeout(current.teardown);
  current.listeners.add(listener);

  return () => {
    current.listeners.delete(listener);
    if (current.listeners.size > 0) return;

    current.teardown = setTimeout(() => {
      entries.delete(name);
      supabase.removeChannel(current.channel);
    }, TEARDOWN_DELAY_MS);
  };
}
