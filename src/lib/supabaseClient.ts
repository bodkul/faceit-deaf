import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config";

export const supabase = createClient(
  supabaseConfig.URL,
  supabaseConfig.ANON_KEY,
  {
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, { ...options, cache: "no-store" });
      },
    },
  }
);
