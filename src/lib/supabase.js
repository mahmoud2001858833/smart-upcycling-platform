import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://hbllosyoutuautignyop.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhibGxvc3lvdXR1YXV0aWdueW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTE3MjQsImV4cCI6MjEwNjA4NzcyNH0.AHVw42xTd38SR_JA0Rtm8zPaa1w4GFzjzLq036vGI1o";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
