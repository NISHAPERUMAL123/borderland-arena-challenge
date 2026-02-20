
-- Table to store per-team, per-round results
CREATE TABLE public.team_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_team_results_session ON public.team_results(session_id);
CREATE INDEX idx_team_results_session_team ON public.team_results(session_id, team_name);

-- Enable RLS
ALTER TABLE public.team_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read results for active sessions
CREATE POLICY "Anyone can read results of active sessions"
ON public.team_results
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM game_sessions gs
  WHERE gs.id = team_results.session_id AND gs.is_active = true
));

-- Anyone can insert results (players submit their own scores)
CREATE POLICY "Anyone can insert results"
ON public.team_results
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM game_sessions gs
  WHERE gs.id = team_results.session_id AND gs.is_active = true
));

-- Admins can manage all results
CREATE POLICY "Admins manage results"
ON public.team_results
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live scoreboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_results;
