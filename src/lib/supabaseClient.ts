import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env vars are not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cloud sync.");
} else {
  // log host for debugging (do not log keys)
  try {
    const u = new URL(SUPABASE_URL);
    console.debug("Supabase host:", u.host);
  } catch {}
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");
