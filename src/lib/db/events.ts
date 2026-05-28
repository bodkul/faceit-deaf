import { cache } from "react";

import { supabaseClient } from "@/lib/supabase";

export type EventBySlug = Awaited<ReturnType<typeof getEventBySlug>>;

export const getEventBySlug = cache(async (slug: string) => {
  const { data } = await supabaseClient
    .from("events")
    .select("*")
    .match({ slug })
    .single()
    .throwOnError();
  return data;
});
