import { createClient } from "@supabase/supabase-js";

// ⚠️ These come from your .env.local
const supabaseUrl = "https://cogbkcebqscymzfjkuxq.supabase.co" ;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZ2JrY2VicXNjeW16ZmprdXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDYxODcsImV4cCI6MjA3Mjk4MjE4N30.KvG2TPYD6oqAjA94QxrXv97wEsxq49o-OrFT0hRzeQw";

// Client-side Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
