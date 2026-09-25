import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtdgynwnuxtqidsegjzs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZGd5bndudXh0cWlkc2VnanpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzY4NTAsImV4cCI6MjEwNTgxMjg1MH0.yPiMrrCDws541db0Dw3OiOZDFLUoOxXO1IiV1HwOHB4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
