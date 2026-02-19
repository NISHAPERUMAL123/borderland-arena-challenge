import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        // Assign admin role
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "admin",
        });
        if (roleError) {
          setError("Account created but role assignment failed: " + roleError.message);
          setLoading(false);
          return;
        }
        setMessage("Account created! Check your email to confirm, then log in.");
        setMode("login");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      navigate("/admin");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-4 py-12">
      <motion.div
        className="glass-card p-8 md:p-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-black text-primary neon-text mb-1">ADMIN PORTAL</h1>
          <p className="text-muted-foreground font-body text-sm">Borderland Arena Control Center</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className={`flex-1 py-2 font-display text-xs uppercase tracking-wider transition-colors ${
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Login" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arena.com"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground font-body
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block font-display text-xs uppercase tracking-wider text-muted-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground font-body
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          {error && <p className="text-primary text-sm font-body text-center">{error}</p>}
          {message && <p className="text-emerald-400 text-sm font-body text-center">{message}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-game w-full text-base disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "..." : mode === "login" ? "LOGIN" : "CREATE ADMIN ACCOUNT"}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground font-body text-sm hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
