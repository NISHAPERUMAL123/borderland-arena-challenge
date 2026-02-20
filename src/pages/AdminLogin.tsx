import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ADMIN_EMAIL = "admin@borderland.arena";
const ADMIN_PASSWORD = "admin@#12345";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_email", ADMIN_EMAIL);
      navigate("/admin");
    } else {
      setError("Invalid login credentials.");
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

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-game w-full text-base disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "..." : "LOGIN"}
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
