import { supabase } from "@/integrations/supabase/client";

export { supabase };

export async function getActiveSession(code: string) {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("game_code", code.toUpperCase())
    .eq("is_active", true)
    .single();
  return { data, error };
}

export async function getSessionQuestions(sessionId: string) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("round_number")
    .order("sort_order");
  return { data, error };
}

export function generateGameCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
