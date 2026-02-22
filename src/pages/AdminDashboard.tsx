import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { generateGameCode } from "@/lib/supabase";
import AdminScoreboard from "@/components/AdminScoreboard";

interface Question {
  id?: string;
  session_id?: string;
  round_number: number;
  question_text: string;
  question_type: "multiple_choice" | "text";
  options: string[] | null;
  correct_answer: string;
  sort_order: number;
}

interface GameSession {
  id: string;
  game_code: string;
  is_active: boolean;
  is_started: boolean;
  created_at: string;
}

const roundInfo = [
  { num: 1, name: "Entry Game", type: "multiple_choice" as const, desc: "Logic puzzles & pattern recognition" },
  { num: 2, name: "Mind Trap", type: "multiple_choice" as const, desc: "Reverse coding & logic riddles" },
  { num: 3, name: "Betrayal Stage", type: "multiple_choice" as const, desc: "Coding challenges & reverse code" },
  { num: 4, name: "Final Showdown", type: "text" as const, desc: "Text answer — no multiple choice" },
];

const defaultQuestions: Omit<Question, "id" | "session_id">[] = [
  // Round 1
  { round_number: 1, question_type: "multiple_choice", question_text: "What comes next: 2, 6, 12, 20, 30, ?", options: ["40", "42", "36", "38"], correct_answer: "42", sort_order: 0 },
  { round_number: 1, question_type: "multiple_choice", question_text: "I speak without a mouth and hear without ears. What am I?", options: ["Echo", "Shadow", "Smoke", "Fire"], correct_answer: "Echo", sort_order: 1 },
  { round_number: 1, question_type: "multiple_choice", question_text: "Which step comes FIRST in SDLC?", options: ["Testing", "Deployment", "Requirements Analysis", "Coding"], correct_answer: "Requirements Analysis", sort_order: 2 },
  { round_number: 1, question_type: "multiple_choice", question_text: "All Bloops are Razzles and all Razzles are Lazzles. Are all Bloops Lazzles?", options: ["Yes", "No", "Maybe", "Not enough info"], correct_answer: "Yes", sort_order: 3 },
  { round_number: 1, question_type: "multiple_choice", question_text: "A farmer has 17 sheep. All but 9 die. How many sheep are left?", options: ["8", "9", "17", "0"], correct_answer: "9", sort_order: 4 },
  // Round 2
  { round_number: 2, question_type: "multiple_choice", question_text: "What does console.log(typeof null) output?", options: ["null", "undefined", "object", "boolean"], correct_answer: "object", sort_order: 0 },
  { round_number: 2, question_type: "multiple_choice", question_text: "What is the output of console.log(1 + '1')?", options: ["2", "11", "NaN", "Error"], correct_answer: "11", sort_order: 1 },
  { round_number: 2, question_type: "multiple_choice", question_text: "In binary, what is 1010 + 0110?", options: ["10000", "10100", "1100", "10010"], correct_answer: "10000", sort_order: 2 },
  { round_number: 2, question_type: "multiple_choice", question_text: "What does [1,2,3].map(x => x * 2).filter(x => x > 3) return?", options: ["[4, 6]", "[2, 4, 6]", "[6]", "[4]"], correct_answer: "[4, 6]", sort_order: 3 },
  { round_number: 2, question_type: "multiple_choice", question_text: "What is the output of console.log(0.1 + 0.2 === 0.3)?", options: ["true", "false", "undefined", "NaN"], correct_answer: "false", sort_order: 4 },
  // Round 3
  { round_number: 3, question_type: "multiple_choice", question_text: "Which sorting algorithm has O(n log n) average time complexity?", options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"], correct_answer: "Merge Sort", sort_order: 0 },
  { round_number: 3, question_type: "multiple_choice", question_text: "What does 'DNS' stand for?", options: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Net System"], correct_answer: "Domain Name System", sort_order: 1 },
  { round_number: 3, question_type: "multiple_choice", question_text: "What is the output of console.log(!!'false')?", options: ["true", "false", "undefined", "Error"], correct_answer: "true", sort_order: 2 },
  { round_number: 3, question_type: "multiple_choice", question_text: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Array", "Tree"], correct_answer: "Stack", sort_order: 3 },
  { round_number: 3, question_type: "multiple_choice", question_text: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct_answer: "O(log n)", sort_order: 4 },
  // Round 4 - text answers
  { round_number: 4, question_type: "text", question_text: "What keyword is used to declare a constant in JavaScript?", options: null, correct_answer: "const", sort_order: 0 },
  { round_number: 4, question_type: "text", question_text: "What does HTML stand for?", options: null, correct_answer: "HyperText Markup Language", sort_order: 1 },
  { round_number: 4, question_type: "text", question_text: "What symbol is used for comments in Python?", options: null, correct_answer: "#", sort_order: 2 },
  { round_number: 4, question_type: "text", question_text: "What is the result of 2 ** 10 in Python?", options: null, correct_answer: "1024", sort_order: 3 },
  { round_number: 4, question_type: "text", question_text: "What HTTP method is used to send data to a server?", options: null, correct_answer: "POST", sort_order: 4 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<GameSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [activeRound, setActiveRound] = useState(1);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const isAdmin = localStorage.getItem("admin_authenticated") === "true";
    if (!isAdmin) { navigate("/admin-login"); return; }
    setUserEmail(localStorage.getItem("admin_email") || "");

    // Load active session
    const { data: sessionData } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionData) {
      setSession(sessionData);
      const { data: qData } = await supabase
        .from("questions")
        .select("*")
        .eq("session_id", sessionData.id)
        .order("round_number")
        .order("sort_order");
      setQuestions((qData as Question[]) || []);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const createSession = async () => {
    setCreatingSession(true);

    // Deactivate old sessions and reset state
    await supabase.from("game_sessions").update({ is_active: false }).eq("is_active", true);
    setQuestions([]);

    let code = generateGameCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase.from("game_sessions").select("id").eq("game_code", code).maybeSingle();
      if (!existing) break;
      code = generateGameCode();
      attempts++;
    }

    const { data: newSession, error } = await supabase
      .from("game_sessions")
      .insert({ game_code: code, admin_id: "admin", is_active: true, is_started: false })
      .select()
      .single();

    if (error || !newSession) { setCreatingSession(false); return; }

    // Seed default questions
    const toInsert = defaultQuestions.map((q) => ({ ...q, session_id: newSession.id }));
    await supabase.from("questions").insert(toInsert);

    setCreatingSession(false);
    loadData();
  };

  const startGame = async () => {
    if (!session) return;
    await supabase.from("game_sessions").update({ is_started: true }).eq("id", session.id);
    setSession({ ...session, is_started: true });
  };

  const deactivateSession = async () => {
    if (!session) return;
    await supabase.from("game_sessions").update({ is_active: false }).eq("id", session.id);
    setSession(null);
    setQuestions([]);
  };

  const copyCode = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.game_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEdit = (q: Question) => setEditingQ({ ...q, options: q.options ? [...q.options] : null });

  const saveQuestion = async () => {
    if (!editingQ || !session) return;
    setSaving(true);
    if (editingQ.id) {
      await supabase.from("questions").update({
        question_text: editingQ.question_text,
        correct_answer: editingQ.correct_answer,
        options: editingQ.options,
      }).eq("id", editingQ.id);
    }
    setSaving(false);
    setEditingQ(null);
    loadData();
  };

  const roundQuestions = questions.filter((q) => q.round_number === activeRound);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    navigate("/admin-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <motion.div className="text-primary font-display text-xl animate-pulse">LOADING...</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg px-4 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-primary neon-text">ADMIN DASHBOARD</h1>
            <p className="text-muted-foreground font-body text-sm">{userEmail}</p>
          </div>
          <button onClick={handleLogout} className="text-muted-foreground font-body text-sm hover:text-primary transition-colors px-4 py-2 border border-border rounded-lg hover:border-primary/50">
            Logout
          </button>
        </motion.div>

        {/* Game Session Card */}
        <motion.div className="glass-card p-6 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4">Active Game Session</h2>
          {session ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <p className="font-display text-xs text-muted-foreground uppercase mb-1">Game Code</p>
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl md:text-5xl font-black text-primary neon-text tracking-[0.3em]">
                    {session.game_code}
                  </span>
                  <button
                    onClick={copyCode}
                    className="px-3 py-1 border border-border rounded font-body text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-muted-foreground font-body text-xs mt-1">
                  Share this code with your players to join the game
                </p>
              </div>
              {!session.is_started ? (
                <motion.button
                  onClick={startGame}
                  className="btn-game"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  START GAME
                </motion.button>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-display text-xs uppercase tracking-wider">
                  Game Live
                </span>
              )}
              <button
                onClick={deactivateSession}
                className="px-4 py-2 border border-destructive/50 text-destructive rounded-lg font-body text-sm hover:bg-destructive/10 transition-colors"
              >
                End Session
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground font-body mb-4">No active game session. Create one to generate a code.</p>
              <motion.button
                onClick={createSession}
                disabled={creatingSession}
                className="btn-game disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {creatingSession ? "CREATING..." : "CREATE NEW GAME SESSION"}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Questions Editor */}
        {session && (
          <>
            <motion.div className="glass-card p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4">Questions Editor</h2>

              {/* Round Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {roundInfo.map((r) => (
                  <button
                    key={r.num}
                    onClick={() => setActiveRound(r.num)}
                    className={`shrink-0 px-4 py-2 rounded-lg font-display text-xs uppercase tracking-wider transition-colors ${activeRound === r.num
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                  >
                    R{r.num}: {r.name}
                  </button>
                ))}
              </div>

              {/* Round description */}
              <p className="text-muted-foreground font-body text-sm mb-4">
                {roundInfo[activeRound - 1].desc}
                {activeRound === 4 && <span className="ml-2 text-primary font-display text-xs uppercase">[Text answer — no options]</span>}
              </p>

              {/* Question List */}
              <div className="space-y-3">
                {roundQuestions.map((q, idx) => (
                  <motion.div
                    key={q.id || idx}
                    className="glass-card p-4 flex items-start gap-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center font-display text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-foreground text-sm mb-1">{q.question_text}</p>
                      {q.options && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {q.options.map((opt) => (
                            <span key={opt} className={`text-xs px-2 py-0.5 rounded font-body ${opt === q.correct_answer ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs font-body text-emerald-400">✓ {q.correct_answer}</p>
                    </div>
                    <button
                      onClick={() => openEdit(q)}
                      className="shrink-0 px-3 py-1.5 border border-border rounded font-body text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      Edit
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Scoreboard */}
            <motion.div className="glass-card p-6 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h2 className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-4">Live Scoreboard</h2>
              <AdminScoreboard sessionId={session.id} />
            </motion.div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingQ && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="font-display text-lg font-bold text-primary mb-4">Edit Question</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Question</label>
                  <textarea
                    value={editingQ.question_text}
                    onChange={(e) => setEditingQ({ ...editingQ, question_text: e.target.value })}
                    rows={3}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground font-body text-sm
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
                  />
                </div>

                {editingQ.question_type === "multiple_choice" && editingQ.options && (
                  <div>
                    <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">Options</label>
                    {editingQ.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...editingQ.options!];
                            newOpts[i] = e.target.value;
                            setEditingQ({ ...editingQ, options: newOpts });
                          }}
                          className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-foreground font-body text-sm
                            focus:outline-none focus:border-primary transition-colors"
                        />
                        <span className="text-xs text-muted-foreground self-center">Opt {i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    Correct Answer {editingQ.question_type === "multiple_choice" ? "(must match an option exactly)" : ""}
                  </label>
                  <input
                    value={editingQ.correct_answer}
                    onChange={(e) => setEditingQ({ ...editingQ, correct_answer: e.target.value })}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-foreground font-body text-sm
                      focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingQ(null)}
                  className="flex-1 py-2 border border-border rounded-lg font-body text-sm text-muted-foreground hover:border-primary/50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={saveQuestion}
                  disabled={saving}
                  className="flex-1 btn-game disabled:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? "SAVING..." : "SAVE"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
