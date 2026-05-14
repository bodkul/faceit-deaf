import { cache } from "react";

import { supabaseClient } from "@/lib/supabase";

export type EventById = Awaited<ReturnType<typeof getEventById>>;

export const getEventById = cache(async (id: string) => {
  const { data } = await supabaseClient
    .from("events")
    .select("name, logo_url, start_date, end_date")
    .eq("id", id)
    .single()
    .throwOnError();
  return data;
});
