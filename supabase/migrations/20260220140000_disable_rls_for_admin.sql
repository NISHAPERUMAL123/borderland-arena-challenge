
-- Disable RLS on all admin-managed tables so the app works without Supabase Auth
ALTER TABLE public.game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop the foreign key constraint on admin_id so we can use any string
ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_admin_id_fkey;

-- Make admin_id nullable and default to 'admin'
ALTER TABLE public.game_sessions ALTER COLUMN admin_id DROP NOT NULL;
ALTER TABLE public.game_sessions ALTER COLUMN admin_id SET DEFAULT 'admin';
