-- ============================================================
-- SQL Schema for Smart Upcycling Platform (Supabase)
-- ============================================================

-- 1. Table for Saved Projects
CREATE TABLE IF NOT EXISTS public.saved_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  idea TEXT,
  materials TEXT,
  tools TEXT,
  steps TEXT,
  principle TEXT,
  time TEXT,
  difficulty TEXT,
  safety TEXT,
  results TEXT,
  development TEXT,
  sustainability TEXT,
  gallery_finished TEXT,
  gallery_assembly TEXT,
  gallery_in_use TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved projects"
  ON public.saved_projects
  FOR ALL
  USING (auth.uid() = user_id);

-- 2. Table for Environmental Impact & Gamification Points
CREATE TABLE IF NOT EXISTS public.user_environmental_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  waste_reduced_kg NUMERIC(8, 2) DEFAULT 0.00,
  co2_saved_kg NUMERIC(8, 2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_environmental_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own stats"
  ON public.user_environmental_stats
  FOR ALL
  USING (auth.uid() = user_id);
