-- ==============================================================================
-- ANYTHING CREATIVE ECOSYSTEM — MASTER SUPABASE DATABASE SCHEMA
-- Centralized Authentication, Cross-App Identity, Admin Metrics & App Screen Time
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'pro', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast user query
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. APP USAGE & SCREEN TIME SESSIONS (Tracks time stayed in each app)
CREATE TABLE IF NOT EXISTS public.app_usage_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_user_id ON public.app_usage_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_app_id ON public.app_usage_sessions(app_id);
CREATE INDEX IF NOT EXISTS idx_usage_started_at ON public.app_usage_sessions(started_at);

-- 3. VIDEO RENDER LOGS (Tracks videos rendered in MediaFlow Studio & Ecosystem)
CREATE TABLE IF NOT EXISTS public.video_render_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_title TEXT NOT NULL,
  app_name TEXT NOT NULL DEFAULT 'MediaFlow Studio',
  resolution TEXT DEFAULT '1080p',
  render_duration_seconds INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('rendering', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_renders_user_id ON public.video_render_logs(user_id);

-- 4. SAFAR COMPLETION LOGS (Tracks Safars completed in One Tap & Ecosystem)
CREATE TABLE IF NOT EXISTS public.safar_completion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  safar_name TEXT NOT NULL,
  app_name TEXT NOT NULL DEFAULT 'One Tap',
  dates_count INTEGER DEFAULT 1,
  total_files INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_safars_user_id ON public.safar_completion_logs(user_id);

-- 5. AGGREGATED USER METRICS SUMMARY TABLE (Fast reads for Admin Dashboard)
CREATE TABLE IF NOT EXISTS public.user_metrics (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  videos_rendered_count INTEGER NOT NULL DEFAULT 0,
  safars_completed_count INTEGER NOT NULL DEFAULT 0,
  total_screen_time_seconds INTEGER NOT NULL DEFAULT 0,
  last_video_rendered_at TIMESTAMPTZ,
  last_safar_completed_at TIMESTAMPTZ,
  app_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Triggers whenever a user signs up via Email or Google OAuth
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, last_seen_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    -- Default the architect/founder email to 'admin' automatically:
    CASE 
      WHEN NEW.email IN ('admin@anything.com', 'admin@anything.local', 'burhanuddin@anything.local') THEN 'admin'
      ELSE 'member'
    END,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    last_seen_at = now(),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  -- Initialize empty metrics row
  INSERT INTO public.user_metrics (user_id, videos_rendered_count, safars_completed_count, total_screen_time_seconds, app_breakdown)
  VALUES (NEW.id, 0, 0, 0, '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_usage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_render_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safar_completion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- APP USAGE POLICIES
CREATE POLICY "Users can insert and read their own usage sessions"
  ON public.app_usage_sessions FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- VIDEO RENDER LOGS POLICIES
CREATE POLICY "Users and admins can manage video render logs"
  ON public.video_render_logs FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- SAFAR LOGS POLICIES
CREATE POLICY "Users and admins can manage safar completion logs"
  ON public.safar_completion_logs FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- USER METRICS POLICIES
CREATE POLICY "Users can read own metrics; Admins can read all"
  ON public.user_metrics FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users and admins can update metrics"
  ON public.user_metrics FOR ALL
  USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- DEMO SEED DATA (Optional: for testing admin dashboard immediately)
-- ==============================================================================
-- You can run these sample rows if you want instant test data in Supabase!

