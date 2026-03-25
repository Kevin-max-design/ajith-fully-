import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useAuth } from "../components/AuthContext";
import { signup } from "../api";

export function SignupPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(role === "investor" ? "INVESTOR" : "FOUNDER");

  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate(profile.role === "INVESTOR" ? "/investor" : "/founder");
    }
  }, [authLoading, user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup({ email, name, role: selectedRole, password });
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center px-6 bg-black">
      <div className="text-center mb-10 max-w-[640px]">
        <h2 className="font-headline text-[2.5rem] font-bold text-white tracking-tight mb-4">Request Access</h2>
        <p className="font-body text-white/60 text-[0.875rem] leading-relaxed">
          Create an account to join the Monolith network as a founder or investor.
        </p>
      </div>

      <div className="w-full max-w-[600px] bg-[rgba(255,255,255,0.02)] ghost-border rounded-3xl p-8 md:p-12">
        {error && (
          <div className="mb-6 p-4 bg-[rgba(255,180,171,0.1)] text-[#ffb4ab] rounded-xl font-body text-sm ghost-border">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">Full Name</label>
            <input
              type="text" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">Email Address</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="john@monolith.vc"
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
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">Role</label>
            <div className="relative">
              <select
                value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white appearance-none focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
              >
                <option value="FOUNDER">Founder</option>
                <option value="INVESTOR">Investor</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white/40">expand_more</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black mt-4 py-4 rounded-full font-bold text-[15px] font-sans button-glow hover:bg-white/90 transition-all duration-300 disabled:opacity-50">
            {loading ? "Processing..." : "Secure Access"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-sm font-body">
          Already have an account? <Link to="/login" className="text-white hover:underline">Sign In.</Link>
        </p>
      </div>
    </div>
  );
}
