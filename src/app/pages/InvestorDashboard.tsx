import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "../components/GlassCard";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useAuth } from "../components/AuthContext";

const sidebarItems = [
  { icon: "grid_view", label: "Startup Feed", id: "feed" },
  { icon: "bookmark", label: "Saved", id: "saved" },
  { icon: "rocket_launch", label: "Requests Sent", id: "requests" },
  { icon: "query_stats", label: "Matches", id: "matches" },
  { icon: "mail", label: "Messages", id: "messages" },
  { icon: "account_circle", label: "Profile", id: "profile" },
];

function StartupCard({ startup, onSave, onRequest, requestedIds }: { startup: any; onSave: (id: string) => void; onRequest: (id: string) => void; requestedIds: Set<string> }) {
  const alreadyRequested = requestedIds.has(startup.id);
  return (
    <div className="glass-card ghost-border p-6 rounded-xl space-y-5 hover:bg-[rgba(255,255,255,0.05)] transition-all group">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] font-label text-[10px] font-medium text-white/60 uppercase tracking-widest">{startup.industry}</span>
        <span className="px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] font-label text-[10px] font-medium text-white/60 uppercase tracking-widest">{startup.stage}</span>
      </div>
      {/* Pitch */}
      <p className="font-body text-[0.875rem] text-white/60 leading-relaxed line-clamp-3">{startup.pitch}</p>
      {/* Tags list */}
      {startup.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {startup.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 rounded bg-[rgba(255,255,255,0.03)] text-white/40 text-[10px]">{tag}</span>
          ))}
        </div>
      )}
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40">Funding Needed</p>
          <p className="text-lg font-headline font-bold text-white">{startup.fundingNeeded}</p>
        </div>
        <div className="text-right">
          <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40">Location</p>
          <p className="font-body text-sm text-white/80">{startup.location}</p>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => !alreadyRequested && onRequest(startup.id)}
          disabled={alreadyRequested}
          className={`flex-1 py-3 rounded-full font-label text-[10px] uppercase tracking-[0.1em] font-bold transition-all ${
            alreadyRequested
              ? "bg-[rgba(255,255,255,0.05)] text-white/30 cursor-not-allowed"
              : "monolith-gradient text-black inner-glow hover:opacity-90"
          }`}
        >
          {alreadyRequested ? "Request Sent" : "Request Access"}
        </button>
        <button
          onClick={() => onSave(startup.id)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ghost-border ${startup.saved ? "text-white bg-[rgba(255,255,255,0.1)]" : "text-white/40 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"}`}
        >
          <span className="material-symbols-outlined text-[18px]">{startup.saved ? "bookmark" : "bookmark_border"}</span>
        </button>
      </div>
    </div>
  );
}

function InvestorMessagesPanel({ userId, matchedUsers }: { userId: string; matchedUsers: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedUser) return;
    const loadMessages = async () => {
      const { data } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedUser.founderId}),and(sender_id.eq.${selectedUser.founderId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    loadMessages();
    const channel = supabase.channel(`inv-msgs-${userId}-${selectedUser.founderId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if ((msg.sender_id === userId && msg.receiver_id === selectedUser.founderId) || (msg.sender_id === selectedUser.founderId && msg.receiver_id === userId)) {
          setMessages((prev) => [...prev, msg]);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, userId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser || sending) return;
    setSending(true);
    await supabase.from("messages").insert({ sender_id: userId, receiver_id: selectedUser.founderId, content: newMsg.trim() });
    setNewMsg(""); setSending(false);
  };

  if (matchedUsers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white/20">mail</span>
        </div>
        <p className="font-body text-white/60 font-semibold">No messages yet</p>
        <p className="font-body text-white/30 text-[0.75rem] mt-1">Get matched with a startup to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[500px]">
      <div className="w-[240px] shrink-0 rounded-xl overflow-hidden glass-card ghost-border">
        <div className="p-4 ghost-border-b"><p className="font-label text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">Conversations</p></div>
        <div className="overflow-y-auto h-[calc(100%-52px)] no-scrollbar">
          {matchedUsers.map((u) => (
            <button key={u.founderId} onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${selectedUser?.founderId === u.founderId ? "bg-[rgba(255,255,255,0.08)] text-white" : "text-white/50 hover:bg-[rgba(255,255,255,0.03)]"}`}>
              <div className="w-8 h-8 rounded-lg ghost-border bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white/60">{u.initials}</span>
              </div>
              <span className="truncate text-[0.875rem] font-medium">{u.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 rounded-xl glass-card ghost-border flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 ghost-border-b flex items-center gap-3 bg-black/60">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              <p className="font-body text-[0.875rem] font-semibold text-white">{selectedUser.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-[0.875rem] font-body ${msg.sender_id === userId ? "bg-white text-black rounded-tr-none" : "glass-card-high ghost-border text-white/80 rounded-tl-none"}`}>
                    {msg.content}
                    <p className={`mt-2 text-[9px] font-label uppercase tracking-[0.1em] ${msg.sender_id === userId ? "text-black/40" : "text-white/30"}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-black/80 ghost-border-t">
              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] ghost-border p-2 pr-2 pl-5 rounded-full focus-within:bg-[rgba(255,255,255,0.05)] transition-colors">
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none font-body text-[0.875rem] focus:ring-0 text-white placeholder-white/20 outline-none" />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50">
                  <span className="material-symbols-outlined text-black text-[18px]">arrow_upward</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 font-body text-[0.875rem]">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

export function InvestorDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");
  const [startups, setStartups] = useState<any[]>([]);
  const [requestsSent, setRequestsSent] = useState<any[]>([]);
  const [requestedStartupIds, setRequestedStartupIds] = useState<Set<string>>(new Set());
  const [matches, setMatches] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedLoading, setFeedLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", email: "", city: "", investment_range: "", bio: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [authLoading, user, navigate]);

  const loadData = async () => {
    if (!user) return;
    setFeedLoading(true);
    const { data: feedData } = await supabase.from("startups").select("*");
    if (feedData) {
      setStartups(feedData.map((d: any) => ({
        id: d.id, custom_id: d.custom_id, industry: d.industry, stage: d.stage, location: d.location,
        fundingNeeded: d.funding_needed, pitch: d.pitch, saved: false, tags: d.tags || []
      })));
    }
    const { data: reqs } = await supabase.from("access_requests").select("*, startup:startups(custom_id, industry, id)").eq("investor_id", user.id);
    if (reqs) { setRequestsSent(reqs); setRequestedStartupIds(new Set(reqs.map((r: any) => r.startup_id))); }
    const { data: mData } = await supabase.from("access_requests").select("*, startup:startups(industry, id, founder_id)").eq("investor_id", user.id).eq("status", "approved");
    if (mData) {
      const founderIds = [...new Set(mData.map((m: any) => m.startup?.founder_id).filter(Boolean))];
      let founderProfiles: any = {};
      if (founderIds.length > 0) {
        const { data: founders } = await supabase.from("profiles").select("*").in("id", founderIds);
        if (founders) founderProfiles = Object.fromEntries(founders.map((f: any) => [f.id, f]));
      }
      setMatches(mData.map((m: any) => {
        const founder = founderProfiles[m.startup?.founder_id] || {};
        return { ...m, founderName: founder.first_name ? `${founder.first_name} ${founder.last_name || ""}`.trim() : (founder.email || "Founder"), founderInitials: `${(founder.first_name || "F")[0]}${(founder.last_name || "")[0] || ""}`.toUpperCase(), founderId: m.startup?.founder_id };
      }));
    }
    setFeedLoading(false);
  };

  useEffect(() => { if (user?.id) loadData(); }, [user?.id]);
  useEffect(() => {
    if (!profile || !user) return;
    const loadInvestorData = async () => {
      const { data: investorData } = await supabase.from("investors").select("*").eq("id", user.id).single();
      setProfileForm({ first_name: profile.first_name || "", last_name: profile.last_name || "", email: profile.email || "", city: profile.city || "", investment_range: investorData?.investment_range || "", bio: investorData?.bio || "" });
    };
    loadInvestorData();
  }, [profile, user]);

  useEffect(() => {
    const channel = supabase.channel("investor-feed").on("postgres_changes", { event: "INSERT", schema: "public", table: "startups" }, () => { loadData(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const toggleSave = (id: string) => setStartups((p) => p.map((s) => (s.id === id ? { ...s, saved: !s.saved } : s)));
  const handleRequest = async (startupId: string) => {
    if (!user?.id) return;
    const { error } = await supabase.from("access_requests").insert({ startup_id: startupId, investor_id: user.id });
    if (error) { setToastMsg(error.code === "23505" ? "You already sent a request for this startup." : `Error: ${error.message}`); }
    else { setToastMsg("Access Request sent successfully!"); setRequestedStartupIds((prev) => new Set([...prev, startupId])); loadData(); }
    setTimeout(() => setToastMsg(""), 3000);
  };
  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true); setProfileMsg("");
    try {
      const { error: profErr } = await supabase.from("profiles").update({ first_name: profileForm.first_name, last_name: profileForm.last_name, city: profileForm.city, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (profErr) throw profErr;
      const { error: invErr } = await supabase.from("investors").update({ investment_range: profileForm.investment_range, bio: profileForm.bio }).eq("id", user.id);
      if (invErr) throw invErr;
      await refreshProfile();
      setProfileMsg("Profile saved successfully!");
    } catch (err: any) { setProfileMsg(`Error: ${err.message}`); }
    setProfileSaving(false);
  };

  const savedStartups = startups.filter((s) => s.saved);
  const filteredStartups = searchQuery ? startups.filter((s) => s.industry.toLowerCase().includes(searchQuery.toLowerCase()) || s.pitch.toLowerCase().includes(searchQuery.toLowerCase())) : startups;
  const matchedUsersForChat = matches.map((m) => ({ founderId: m.founderId, name: m.founderName, initials: m.founderInitials }));

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><span className="material-symbols-outlined text-white/20 text-4xl animate-pulse">sync</span></div>;

  const userName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Investor" : "Investor";

  return (
    <div className="min-h-screen bg-black pt-[72px] flex">
      <DashboardSidebar items={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userName={userName} userRole="Tier 1 Investor" portalLabel="Investor" />

      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-xl backdrop-blur-xl font-body text-sm font-semibold text-white ${toastMsg.startsWith("Error") ? "bg-[rgba(255,180,171,0.9)]" : "bg-[rgba(255,255,255,0.9)] !text-black"}`}>
          {toastMsg}
        </div>
      )}

      <main className="flex-1 min-w-0">
        <header className="sticky top-[72px] z-20 ghost-border-b h-16 flex items-center justify-between px-8 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="lg:hidden w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-white" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <h1 className="font-headline text-xl font-bold tracking-tight text-white">{sidebarItems.find((i) => i.id === activeTab)?.label}</h1>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === "feed" && (
              <div className="hidden sm:flex items-center gap-2 bg-[rgba(255,255,255,0.03)] ghost-border px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-white/40 text-sm">search</span>
                <input type="text" placeholder="Filter by industry, stage..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none text-xs font-body focus:ring-0 text-white w-48 placeholder-white/20 outline-none" />
              </div>
            )}
            <button className="relative p-2 rounded-full ghost-border text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
          {activeTab === "feed" && (
            <>
              {feedLoading ? (
                <div className="flex justify-center py-20"><span className="material-symbols-outlined text-white/20 text-4xl animate-pulse">sync</span></div>
              ) : filteredStartups.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white/20">grid_view</span>
                  </div>
                  <p className="font-body text-white/60 font-semibold">No startups yet</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-[2rem] font-headline font-bold text-white tracking-[-0.04em]">Verified Opportunities</h3>
                      <p className="font-body text-sm text-white/40">Curated deal flow matching your investment thesis.</p>
                    </div>
                    <button className="font-label text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-[0.1em] ghost-border-b pb-1 transition-colors">View All</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStartups.map((s) => (
                      <StartupCard key={s.id} startup={s} onSave={toggleSave} onRequest={handleRequest} requestedIds={requestedStartupIds} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "saved" && (
            savedStartups.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white/20">bookmark</span>
                </div>
                <p className="font-body text-white/60 font-semibold">No saved startups</p>
                <p className="font-body text-white/30 text-[0.75rem] mt-1">Save startups from the feed to review later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStartups.map((s) => <StartupCard key={s.id} startup={s} onSave={toggleSave} onRequest={handleRequest} requestedIds={requestedStartupIds} />)}
              </div>
            )
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[2rem] font-headline font-bold text-white tracking-[-0.04em]">Active Inquiries</h3>
                <div className="flex items-center gap-4">
                  <span className="font-label text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">Sort by: Recent</span>
                </div>
              </div>
              {requestsSent.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white/20">rocket_launch</span>
                  </div>
                  <p className="font-body text-white/60 font-semibold">No requests sent</p>
                </div>
              ) : (
                <div className="glass-card ghost-border rounded-xl overflow-hidden">
                  {/* Table header */}
                  <div className="w-full flex text-left font-label text-[10px] uppercase tracking-[0.1em] font-bold text-white/40 px-8 py-5 ghost-border-b">
                    <div className="w-1/4">Startup</div>
                    <div className="w-1/4">Type</div>
                    <div className="w-1/4">Status</div>
                    <div className="w-1/4">Date</div>
                  </div>
                  <div className="flex flex-col gap-1 px-4">
                    {requestsSent.map((req) => (
                      <div key={req.id} className="group flex items-center hover:bg-[rgba(255,255,255,0.03)] rounded-lg transition-colors px-4 py-4">
                        <div className="w-1/4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[rgba(255,255,255,0.05)] ghost-border flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-white/40">layers</span>
                          </div>
                          <span className="font-body text-sm font-semibold text-white">{req.startup?.custom_id || "Startup"}</span>
                        </div>
                        <div className="w-1/4"><span className="font-body text-[0.875rem] text-white/60">{req.startup?.industry || "Access Request"}</span></div>
                        <div className="w-1/4 flex items-center gap-2">
                          <div className={`w-1 h-3 rounded-[1px] ${req.status === "approved" ? "bg-white" : req.status === "rejected" ? "bg-white/10" : "bg-white/40"}`}></div>
                          <span className={`font-body text-[0.875rem] font-medium tracking-wide ${req.status === "approved" ? "text-white" : req.status === "rejected" ? "text-white/40" : "text-white/60"}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                        <div className="w-1/4"><span className="font-body text-[0.875rem] text-white/40">{new Date(req.created_at).toLocaleDateString()}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-4">
              {matches.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white/20">query_stats</span>
                  </div>
                  <p className="font-body text-white/60 font-semibold">No matches yet</p>
                </div>
              ) : matches.map((m) => (
                <div key={m.id} className="group glass-card ghost-border p-6 rounded-xl flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.03)] ghost-border flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/60">handshake</span>
                    </div>
                    <div>
                      <h4 className="font-sans text-[1rem] font-semibold text-white">{m.founderName}</h4>
                      <p className="font-body text-[0.75rem] text-white/50 mt-1">{m.startup?.industry} · Matched on {m.updated_at ? new Date(m.updated_at).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("messages")} className="px-3 py-1.5 rounded-full ghost-border font-label text-[10px] font-bold text-white uppercase tracking-[0.1em] hover:bg-white hover:text-black transition-all">
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "messages" && <InvestorMessagesPanel userId={user?.id || ""} matchedUsers={matchedUsersForChat} />}

          {activeTab === "profile" && (
            <div className="glass-card ghost-border rounded-2xl p-8 md:p-10 max-w-xl">
              <h3 className="font-headline text-[1.5rem] font-bold text-white mb-2">Investor Profile</h3>
              <p className="font-body text-white/40 text-[0.875rem] mb-8">Your profile is visible to founders when you request access</p>
              {profileMsg && (
                <div className={`mb-6 p-4 rounded-xl font-body text-sm ghost-border ${profileMsg.startsWith("Error") ? "bg-[rgba(255,180,171,0.1)] text-[#ffb4ab]" : "bg-[rgba(255,255,255,0.05)] text-white"}`}>{profileMsg}</div>
              )}
              <div className="flex flex-col gap-5">
                {[
                  { l: "FIRST NAME", k: "first_name" as const },
                  { l: "LAST NAME", k: "last_name" as const },
                  { l: "EMAIL", k: "email" as const, disabled: true },
                  { l: "CITY", k: "city" as const },
                  { l: "INVESTMENT RANGE", k: "investment_range" as const },
                ].map((f) => (
                  <div key={f.l} className="flex flex-col gap-3">
                    <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">{f.l}</label>
                    <input type="text" value={profileForm[f.k]} disabled={f.disabled} onChange={(e) => setProfileForm({ ...profileForm, [f.k]: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50" />
                  </div>
                ))}
                <div className="flex flex-col gap-3">
                  <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">BIO</label>
                  <textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white focus:outline-none focus:border-white/40 transition-colors resize-none" />
                </div>
                <button onClick={handleSaveProfile} disabled={profileSaving} className="w-full bg-white text-black mt-2 py-4 rounded-full font-bold text-[14px] font-sans button-glow hover:bg-white/90 transition-all duration-300 disabled:opacity-50">
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
