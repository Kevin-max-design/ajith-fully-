import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../components/AuthContext";
import { supabase } from "../../lib/supabase";

export function LoginPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(profile.role === "INVESTOR" ? "/investor" : "/founder");
    }
  }, [authLoading, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // Auth listener will handle redirect
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6 bg-black">
      <div className="text-center mb-10 max-w-[640px]">
        <h2 className="font-headline text-[2.5rem] font-bold text-white tracking-tight mb-4">Terminal Access</h2>
        <p className="font-body text-white/60 text-[0.875rem] leading-relaxed">
          Log in with your credentials to access the ecosystem.
        </p>
      </div>

      <div className="w-full max-w-[500px] bg-[rgba(255,255,255,0.02)] ghost-border rounded-3xl p-8 md:p-12">
        {error && (
          <div className="mb-6 p-4 bg-[rgba(255,180,171,0.1)] text-[#ffb4ab] rounded-xl font-body text-sm ghost-border">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black mt-4 py-4 rounded-full font-bold text-[15px] font-sans button-glow hover:bg-white/90 transition-all duration-300 disabled:opacity-50">
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-sm font-body">
          Don't have access? <Link to="/signup/founder" className="text-white hover:underline">Apply for an invite.</Link>
        </p>
      </div>
    </div>
  );
}
