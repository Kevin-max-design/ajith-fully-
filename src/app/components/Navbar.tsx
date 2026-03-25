import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (profile?.role === "INVESTOR") return "/investor";
    return "/founder";
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-lg ghost-border-b transition-all duration-500">
        <div className="flex justify-between items-center px-6 md:px-[120px] py-[20px] w-full max-w-[1440px] mx-auto">
          <Link to="/" className="font-headline text-2xl font-black tracking-tighter text-white focus:outline-none">
            STARHUB
          </Link>

          <div className="hidden md:flex items-center gap-8 font-sans text-[13px] font-medium tracking-tight">
            {!user ? (
              <>
                <Link to="/login" className="text-white/60 hover:text-white transition-all duration-300">Login</Link>
                <Link to="/signup/founder" className="text-white nav-link-active transition-all duration-300">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="text-white/60 hover:text-white transition-all duration-300">Dashboard</Link>
                <button onClick={handleSignOut} className="text-white/60 hover:text-white transition-all duration-300">Sign Out</button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <Link to="/signup/founder" className="bg-white text-black px-8 py-2.5 rounded-full font-medium text-[14px] button-glow hover:bg-white/90 hover:scale-[0.97] transition-all duration-300 inline-block text-center">
                Join Waitlist
              </Link>
            )}
          </div>

          <button onClick={() => setMobileOpen(true)} className="md:hidden flex flex-col gap-[5px] p-2" aria-label="Menu">
            <span className="block w-[22px] h-[1.5px] bg-white/80"></span>
            <span className="block w-[22px] h-[1.5px] bg-white/80"></span>
            <span className="block w-[22px] h-[1.5px] bg-white/80"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 transition-opacity duration-500 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-white/60 text-2xl" aria-label="Close">✕</button>
        {!user ? (
          <>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="font-headline text-2xl font-semibold text-white/70 hover:text-white">Login</Link>
            <Link to="/signup/founder" onClick={() => setMobileOpen(false)} className="font-headline text-2xl font-semibold text-white/70 hover:text-white">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="font-headline text-2xl font-semibold text-white/70 hover:text-white">Dashboard</Link>
            <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="font-headline text-2xl font-semibold text-white/70 hover:text-white">Sign Out</button>
          </>
        )}
      </div>
    </>
  );
}
