import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { GlassCard } from "../components/GlassCard";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useAuth } from "../components/AuthContext";

const sidebarItems = [
  { icon: "grid_view", label: "Overview", id: "startup" },
  { icon: "person_search", label: "Investor Requests", id: "requests", badge: 0 },
  { icon: "verified", label: "Approved Investors", id: "approved" },
  { icon: "chat_bubble", label: "Messages", id: "messages" },
  { icon: "settings", label: "Settings", id: "settings" },
];

function CreateStartupForm({ userId, onCreated }: { userId: string; onCreated: () => void }) {
  const [form, setForm] = useState({ industry: "", stage: "", location: "", funding_needed: "", pitch: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.industry || !form.stage || !form.location || !form.funding_needed || !form.pitch) {
      setError("Please fill in all required fields."); return;
    }
    setSaving(true);
    const customId = `STR-${Date.now().toString(36).toUpperCase()}`;
    const { error: err } = await supabase.from("startups").insert({
      founder_id: userId, custom_id: customId,
      industry: form.industry, stage: form.stage, location: form.location,
      funding_needed: form.funding_needed, pitch: form.pitch,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onCreated();
  };

  return (
    <div className="glass-card ghost-border rounded-2xl p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl ghost-border bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
          <span className="material-symbols-outlined text-white/60">add_circle</span>
        </div>
        <div>
          <h3 className="font-headline text-[1.5rem] font-bold text-white">Create Your Startup</h3>
          <p className="font-body text-white/40 text-[0.875rem]">Fill in your details to get discovered by investors</p>
        </div>
      </div>
      {error && <div className="mb-6 p-4 bg-[rgba(255,180,171,0.1)] text-[#ffb4ab] rounded-xl font-body text-sm ghost-border">{error}</div>}
      <form onSubmit={handleCreate} className="flex flex-col gap-5 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">INDUSTRY *</label>
            <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white appearance-none focus:outline-none focus:border-white/40 transition-colors cursor-pointer" required>
              <option value="" disabled>Select industry</option>
              <option>FinTech</option><option>HealthTech</option><option>EdTech</option><option>SaaS</option><option>AI/ML</option><option>E-Commerce</option><option>Web3 Infra</option><option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-3">
            <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">STAGE *</label>
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white appearance-none focus:outline-none focus:border-white/40 transition-colors cursor-pointer" required>
              <option value="" disabled>Select stage</option>
              <option>Pre-Seed</option><option>Seed</option><option>Series A</option><option>Series B+</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">LOCATION *</label>
          <input type="text" placeholder="Singapore" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors" required />
        </div>
        <div className="flex flex-col gap-3">
          <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">FUNDING NEEDED *</label>
          <input type="text" placeholder="$150,000" value={form.funding_needed} onChange={(e) => setForm({ ...form, funding_needed: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors" required />
        </div>
        <div className="flex flex-col gap-3">
          <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">PITCH *</label>
          <textarea rows={3} placeholder="Describe your startup..." value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors resize-none" required />
        </div>
        <div className="flex flex-col gap-3">
          <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">TAGS (comma separated)</label>
          <input type="text" placeholder="AI, Payments, B2B" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white placeholder-white/20 focus:outline-none focus:border-white/40 transition-colors" />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-white text-black mt-2 py-4 rounded-full font-bold text-[14px] font-sans button-glow hover:bg-white/90 transition-all duration-300 disabled:opacity-50">
          {saving ? "Creating..." : "Create Startup"}
        </button>
      </form>
    </div>
  );
}

function MessagesPanel({ userId, matchedUsers }: { userId: string; matchedUsers: any[] }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedUser) return;
    const loadMessages = async () => {
      const { data } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${selectedUser.profileId}),and(sender_id.eq.${selectedUser.profileId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    loadMessages();
    const channel = supabase.channel(`msgs-${userId}-${selectedUser.profileId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if ((msg.sender_id === userId && msg.receiver_id === selectedUser.profileId) || (msg.sender_id === selectedUser.profileId && msg.receiver_id === userId)) {
          setMessages((prev) => [...prev, msg]);
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, userId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedUser || sending) return;
    setSending(true);
    await supabase.from("messages").insert({ sender_id: userId, receiver_id: selectedUser.profileId, content: newMsg.trim() });
    setNewMsg(""); setSending(false);
  };

  if (matchedUsers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-white/20">chat_bubble</span>
        </div>
        <p className="font-body text-white/60 text-[0.875rem] font-semibold">No messages yet</p>
        <p className="font-body text-white/30 text-[0.75rem] mt-1">Approve investors to start a conversation</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[500px]">
      <div className="w-[240px] shrink-0 rounded-xl overflow-hidden glass-card ghost-border">
        <div className="p-4 ghost-border-b"><p className="font-label text-[10px] tracking-[0.1em] text-white/40 uppercase font-bold">Conversations</p></div>
        <div className="overflow-y-auto h-[calc(100%-52px)] no-scrollbar">
          {matchedUsers.map((u) => (
            <button key={u.profileId} onClick={() => setSelectedUser(u)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${selectedUser?.profileId === u.profileId ? "bg-[rgba(255,255,255,0.08)] text-white" : "text-white/50 hover:bg-[rgba(255,255,255,0.03)]"}`}>
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
              <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] ghost-border p-2 pr-2 pl-5 rounded-full focus-within:bg-[rgba(255,255,255,0.05)] focus-within:border-[rgba(255,255,255,0.2)] transition-colors">
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

export function FounderDashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("startup");
  const [requests, setRequests] = useState<any[]>([]);
  const [approved, setApproved] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startup, setStartup] = useState<any>(null);
  const [startupLoading, setStartupLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({ first_name: "", last_name: "", email: "", city: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  useEffect(() => { if (!authLoading && !user) navigate("/login"); }, [authLoading, user, navigate]);

  const fetchData = async () => {
    if (!user) return;
    setStartupLoading(true);
    const { data: startupData } = await supabase.from("startups").select("*").eq("founder_id", user.id).single();
    setStartup(startupData);
    if (startupData) {
      const { data: reqs } = await supabase.from("access_requests").select("*, investor:profiles(*)").eq("startup_id", startupData.id).eq("status", "pending");
      if (reqs) setRequests(reqs.map((r: any) => ({ id: r.id, name: r.investor?.first_name ? `${r.investor.first_name} ${r.investor.last_name}`.trim() : (r.investor?.email || "Investor"), range: "Due Diligence Access" })));
      const { data: appr } = await supabase.from("access_requests").select("*, investor:profiles(*)").eq("startup_id", startupData.id).eq("status", "approved");
      if (appr) setApproved(appr.map((r: any) => ({ id: r.id, profileId: r.investor_id, name: r.investor?.first_name ? `${r.investor.first_name} ${r.investor.last_name}`.trim() : (r.investor?.email || "Investor"), initials: `${(r.investor?.first_name || "I")[0]}${(r.investor?.last_name || "")[0] || ""}`.toUpperCase(), approvedAt: new Date(r.updated_at).toLocaleDateString() })));
    }
    setStartupLoading(false);
  };

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);
  useEffect(() => { if (profile) setSettingsForm({ first_name: profile.first_name || "", last_name: profile.last_name || "", email: profile.email || "", city: profile.city || "" }); }, [profile]);
  useEffect(() => {
    if (!startup) return;
    const channel = supabase.channel("founder-requests").on("postgres_changes", { event: "*", schema: "public", table: "access_requests", filter: `startup_id=eq.${startup.id}` }, () => { fetchData(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [startup?.id]);

  const handleApprove = async (id: string) => { await supabase.from("access_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id); setRequests((p) => p.filter((r) => r.id !== id)); fetchData(); };
  const handleReject = async (id: string) => { await supabase.from("access_requests").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", id); setRequests((p) => p.filter((r) => r.id !== id)); };

  const handleSaveSettings = async () => {
    if (!user) return;
    setSettingsSaving(true); setSettingsMsg("");
    try {
      const { error } = await supabase.from("profiles").update({ first_name: settingsForm.first_name, last_name: settingsForm.last_name, city: settingsForm.city, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      setSettingsMsg("Settings saved successfully!");
    } catch (err: any) { setSettingsMsg(`Error: ${err.message}`); }
    setSettingsSaving(false);
  };

  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><span className="material-symbols-outlined text-white/20 text-4xl animate-pulse">sync</span></div>;

  const userName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Founder" : "Founder";
  const sidebarWithBadge = sidebarItems.map((item) => item.id === "requests" ? { ...item, badge: requests.length } : item);

  return (
    <div className="min-h-screen bg-black pt-[72px] flex">
      <DashboardSidebar items={sidebarWithBadge} activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userName={userName} userRole="Stealth" portalLabel="Founder" />

      <main className="flex-1 min-w-0">
        <header className="sticky top-[72px] z-20 ghost-border-b px-8 h-16 flex items-center justify-between bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="lg:hidden w-9 h-9 rounded-lg bg-[rgba(255,255,255,0.05)] flex items-center justify-center text-white" onClick={() => setSidebarOpen(true)}>
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <h1 className="font-headline text-xl font-bold tracking-tight text-white">{sidebarItems.find((i) => i.id === activeTab)?.label}</h1>
          </div>
          <button className="relative p-2 text-white/60 hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            {requests.length > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></span>}
          </button>
        </header>

        <div className="p-8 lg:p-12 space-y-8 max-w-7xl">
          {activeTab === "startup" && (
            startupLoading ? (
              <div className="flex justify-center py-20"><span className="material-symbols-outlined text-white/20 text-4xl animate-pulse">sync</span></div>
            ) : !startup ? (
              <CreateStartupForm userId={user!.id} onCreated={fetchData} />
            ) : (
              <>
                {/* Overview bento grid */}
                <div className="grid grid-cols-12 gap-8">
                  <section className="col-span-12 lg:col-span-8 glass-card ghost-border p-10 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-[1.5rem] font-headline font-bold text-white mb-2">Startup Overview</h2>
                        <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/50">Round: {startup.stage} • Status: Active</p>
                      </div>
                      <span className="ghost-border bg-[rgba(255,255,255,0.05)] text-white/60 text-[10px] font-label px-3 py-1.5 rounded-full uppercase tracking-[0.1em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Live
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mb-12">
                      {[{ l: "Funding Needed", v: startup.funding_needed }, { l: "Industry", v: startup.industry }, { l: "Location", v: startup.location }].map((s) => (
                        <div key={s.l} className="space-y-2">
                          <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40">{s.l}</p>
                          <p className="text-[1.75rem] font-sans font-medium text-white tracking-tight">{s.v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-5 ghost-border-t">
                      <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40 mb-2">PITCH</p>
                      <p className="font-body text-[0.875rem] text-white/60 leading-relaxed">{startup.pitch}</p>
                    </div>
                    {startup.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {startup.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] font-label text-[10px] font-medium text-white/60 uppercase tracking-widest">{tag}</span>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    <div className="glass-card ghost-border p-8 rounded-2xl flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-white/40 text-[18px]">verified</span>
                          <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40 font-bold">Investor Requests</p>
                        </div>
                        <p className="text-[5rem] font-headline font-bold text-white leading-none tracking-tighter">{requests.length}</p>
                      </div>
                      <p className="font-body text-[0.875rem] text-white/60 mt-8">Pending access requests from verified investors.</p>
                    </div>
                    <div className="glass-card ghost-border p-8 rounded-2xl">
                      <p className="font-label text-[10px] uppercase tracking-[0.1em] text-white/40 mb-4">Approved Investors</p>
                      <h3 className="text-xl font-headline font-bold text-white mb-3">{approved.length} Connected</h3>
                      <p className="font-body text-[0.875rem] text-white/60 mb-8 leading-relaxed">Investors with approved data-room access.</p>
                      <button onClick={() => setActiveTab("approved")} className="w-full ghost-border text-white/80 hover:text-white py-3.5 rounded-full font-label text-[10px] tracking-[0.1em] uppercase font-bold hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                        View All
                      </button>
                    </div>
                  </section>
                </div>
              </>
            )
          )}

          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between mb-4 ghost-border-b pb-4">
                <h2 className="text-[1.5rem] font-headline font-bold text-white tracking-tight">Investor Requests</h2>
                <span className="font-label text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">{requests.length} Pending</span>
              </div>
              {requests.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white/20">person_search</span>
                  </div>
                  <p className="font-body text-white/60 font-semibold">All caught up</p>
                  <p className="font-body text-white/30 text-[0.75rem] mt-1">No pending requests</p>
                </div>
              ) : requests.map((req) => (
                <div key={req.id} className="group glass-card ghost-border p-6 rounded-xl flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.03)] ghost-border flex items-center justify-center">
                      <span className="material-symbols-outlined text-white/60">account_balance</span>
                    </div>
                    <div>
                      <h4 className="font-sans text-[1rem] font-semibold text-white">{req.name}</h4>
                      <p className="font-body text-[0.75rem] text-white/50 mt-1">Requesting: {req.range}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleReject(req.id)} className="px-5 py-2.5 rounded-full ghost-border bg-transparent font-label text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">Reject</button>
                    <button onClick={() => handleApprove(req.id)} className="px-5 py-2.5 rounded-full bg-white text-black font-label text-[10px] font-bold uppercase tracking-widest button-glow hover:bg-white/90 hover:scale-[0.97] transition-all">Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="space-y-4">
              {approved.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-14 h-14 rounded-2xl ghost-border bg-[rgba(255,255,255,0.03)] flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white/20">verified</span>
                  </div>
                  <p className="font-body text-white/60 font-semibold">No approved investors</p>
                </div>
              ) : approved.map((inv) => (
                <div key={inv.id} className="group glass-card ghost-border p-6 rounded-xl flex items-center justify-between hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,255,255,0.03)] ghost-border flex items-center justify-center">
                      <span className="font-bold text-white/60 text-sm">{inv.initials}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-sans text-[1rem] font-semibold text-white">{inv.name}</h4>
                        <span className="material-symbols-outlined text-white text-sm">verified</span>
                      </div>
                      <p className="font-body text-[0.75rem] text-white/50 mt-1">Approved on {inv.approvedAt}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("messages")} className="px-3 py-1.5 rounded-full ghost-border font-label text-[10px] font-bold text-white uppercase tracking-[0.1em] hover:bg-white hover:text-black transition-all">Message</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "messages" && <MessagesPanel userId={user?.id || ""} matchedUsers={approved} />}

          {activeTab === "settings" && (
            <div className="glass-card ghost-border rounded-2xl p-8 md:p-10 max-w-xl">
              <h3 className="font-headline text-[1.5rem] font-bold text-white mb-2">Account Settings</h3>
              <p className="font-body text-white/40 text-[0.875rem] mb-8">Manage your account details</p>
              {settingsMsg && (
                <div className={`mb-6 p-4 rounded-xl font-body text-sm ghost-border ${settingsMsg.startsWith("Error") ? "bg-[rgba(255,180,171,0.1)] text-[#ffb4ab]" : "bg-[rgba(255,255,255,0.05)] text-white"}`}>{settingsMsg}</div>
              )}
              <div className="flex flex-col gap-5">
                {[
                  { l: "FIRST NAME", k: "first_name" as const },
                  { l: "LAST NAME", k: "last_name" as const },
                  { l: "EMAIL", k: "email" as const },
                  { l: "CITY", k: "city" as const },
                ].map((f) => (
                  <div key={f.l} className="flex flex-col gap-3">
                    <label className="font-label text-[0.75rem] tracking-[0.1em] text-white/40 uppercase">{f.l}</label>
                    <input type="text" value={settingsForm[f.k]} disabled={f.k === "email"} onChange={(e) => setSettingsForm({ ...settingsForm, [f.k]: e.target.value })} className="w-full bg-black ghost-border rounded-xl px-4 py-4 text-[0.875rem] text-white focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50" />
                  </div>
                ))}
                <button onClick={handleSaveSettings} disabled={settingsSaving} className="w-full bg-white text-black mt-2 py-4 rounded-full font-bold text-[14px] font-sans button-glow hover:bg-white/90 transition-all duration-300 disabled:opacity-50">
                  {settingsSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
