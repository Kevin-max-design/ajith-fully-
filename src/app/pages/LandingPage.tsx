import { useEffect, useRef } from "react";
import { Link } from "react-router";

export function LandingPage() {
  const statPortfolioRef = useRef<HTMLDivElement>(null);
  const statTpsRef = useRef<HTMLDivElement>(null);
  const statNodesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function animateValue(el: HTMLElement | null, target: number, prefix = "", suffix = "", duration = 1400) {
      if (!el) return;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const v = Math.floor(target * ease);
        el.textContent = prefix + v.toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    setTimeout(() => {
      animateValue(statPortfolioRef.current, 124592, "$", ".00");
      animateValue(statTpsRef.current, 42800, "", "+");
      animateValue(statNodesRef.current, 1204);
    }, 500);

    const reveals = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <main className="relative min-h-[100vh] w-full flex flex-col items-center justify-center pt-[240px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover object-top">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <div className="anim-fade-down mb-8 flex items-center gap-2 bg-[rgba(255,255,255,0.08)] ghost-border px-4 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-white rounded-full pulse-dot"></div>
            <span className="text-[0.875rem] font-body text-white/60 font-medium">
              Early access available from <span className="text-white/80">May 1, 2026</span>
            </span>
          </div>

          <h1 className="anim-fade-up anim-delay-1 text-[3.5rem] md:text-[4.5rem] leading-[1.1] font-display font-medium max-w-[900px] mb-6 tracking-[-0.04em] text-gradient-hero font-headline">
            Capital at the Speed<br />of Trust
          </h1>

          <p className="anim-fade-up anim-delay-2 text-[0.875rem] font-body text-white/60 max-w-[500px] mb-10 leading-relaxed">
            Powering private capital flows and meaningful connections, StartHub empowers founders and investors to move with clarity, trust, and precision.
          </p>

          <div className="anim-fade-up anim-delay-3 flex flex-col sm:flex-row gap-4 mb-20">
            <Link to="/signup/founder" className="bg-white text-black px-10 py-4 rounded-full font-semibold text-[15px] button-glow hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/5 btn-cta">
              Join Waitlist
            </Link>
          </div>

          {/* Terminal Dashboard */}
          <div className="anim-fade-up anim-delay-4 w-full max-w-4xl mt-8">
            <div className="relative terminal-shimmer bg-[rgba(255,255,255,0.03)] backdrop-blur-2xl ghost-border rounded-2xl p-6 shadow-2xl overflow-hidden text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10"></div>
                  <div className="w-3 h-3 rounded-full bg-white/5"></div>
                </div>
                <div className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">EOS TERMINAL V1.0</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card bg-[rgba(255,255,255,0.03)] rounded-xl p-4 ghost-border">
                  <div className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 mb-2 uppercase">PORTFOLIO VALUE</div>
                  <div className="text-[1.125rem] font-body font-semibold tracking-tight text-white" ref={statPortfolioRef}>$0.00</div>
                  <div className="mt-4 h-12 w-full flex items-end gap-1">
                    <div className="flex-1 bg-white/10 h-1/2 rounded-t-sm"></div>
                    <div className="flex-1 bg-white/20 h-2/3 rounded-t-sm"></div>
                    <div className="flex-1 bg-white/30 h-1/3 rounded-t-sm"></div>
                    <div className="flex-1 bg-white/40 h-full rounded-t-sm"></div>
                    <div className="flex-1 bg-white/20 h-1/2 rounded-t-sm"></div>
                  </div>
                </div>
                <div className="stat-card bg-[rgba(255,255,255,0.03)] rounded-xl p-4 ghost-border">
                  <div className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 mb-2 uppercase">NETWORK TPS</div>
                  <div className="text-[1.125rem] font-body font-semibold tracking-tight text-white" ref={statTpsRef}>0</div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/80 text-sm">trending_up</span>
                    <span className="text-white/80 text-xs">+12.4%</span>
                  </div>
                </div>
                <div className="stat-card bg-[rgba(255,255,255,0.03)] rounded-xl p-4 ghost-border">
                  <div className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 mb-2 uppercase">CONNECTED NODES</div>
                  <div className="text-[1.125rem] font-body font-semibold tracking-tight text-white" ref={statNodesRef}>0</div>
                  <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="progress-fill h-full bg-[rgba(255,255,255,0.5)] rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* VERIFICATION SECTION */}
      <section className="relative z-10 bg-black pt-32 pb-24">
        <div className="max-w-[1440px] mx-auto px-6 md:px-[120px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { label: "VERIFICATION STATUS", title: "Private Pilot Launch", desc: "Strictly limited architectural testing phase." },
              { label: "AUTHORITY", title: "Founder Approved Access", desc: "Whitelisted entry for strategic partners." },
              { label: "SECURITY", title: "Verified Investors Only", desc: "Compliant onboarding via EOS Monolith." },
            ].map((item) => (
              <div key={item.label} className="reveal glass-card ghost-border rounded-2xl p-8 flex flex-col items-center text-center">
                <span className="font-label text-[0.65rem] tracking-[0.15em] text-white/40 uppercase mb-5 block h-4 leading-4">{item.label}</span>
                <h3 className="font-headline text-[1.5rem] md:text-[1.75rem] font-bold text-white tracking-tight mb-4 min-h-[4.5rem] flex items-center justify-center leading-tight">{item.title}</h3>
                <p className="font-body text-white/50 text-[0.875rem] leading-relaxed max-w-[280px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black ghost-border-t">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:pl-[8.5rem] md:pr-[4rem] py-16 w-full max-w-[1440px] mx-auto gap-8">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="font-headline font-bold text-white text-xl">STARHUB EOS</div>
            <p className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 uppercase">
              © 2026 STARHUB EOS. THE MONOLITH ARCHITECTURE.
            </p>
          </div>
          <div className="flex gap-8">
            {["CONTACT", "PRIVACY POLICY", "TERMS", "SOCIALS"].map((lnk) => (
              <a key={lnk} className="font-label text-[0.75rem] tracking-[0.1em] text-white/60 hover:text-white transition-colors duration-300 uppercase" href="#">{lnk}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
