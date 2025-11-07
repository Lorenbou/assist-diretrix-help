import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dzdyawzxvanwukwaknvj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZHlhd3p4dmFud3Vrd2FrbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTM2MTMsImV4cCI6MjA3MzM2OTYxM30.ZJklOuidDuMBwZQaWh_13NF5rsiCkYArNbSbF9DFrkE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
