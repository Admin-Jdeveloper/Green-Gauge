// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const url = "https://cogbkcebqscymzfjkuxq.supabase.co";
const key ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZ2JrY2VicXNjeW16ZmprdXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDYxODcsImV4cCI6MjA3Mjk4MjE4N30.KvG2TPYD6oqAjA94QxrXv97wEsxq49o-OrFT0hRzeQw";

if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env');

export const supabaseServer = createClient(url, key, { auth: { persistSession: false } });

