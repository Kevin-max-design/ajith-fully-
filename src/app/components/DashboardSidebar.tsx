import { useNavigate } from "react-router";
import { type ComponentType } from "react";
import { useAuth } from "./AuthContext";

interface SidebarItem {
  icon: string; // Material Symbols icon name
  label: string;
  id: string;
  badge?: number;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userName: string;
  userRole: string;
  portalLabel?: string;
}

export function DashboardSidebar({
  items, activeTab, setActiveTab, isOpen, setIsOpen, userName, userRole, portalLabel = "Portal",
}: DashboardSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen flex flex-col py-6 px-6 transition-transform duration-300 lg:translate-x-0 ghost-border-r bg-black ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="text-2xl font-headline font-black tracking-tighter text-white mb-8 mt-2">STARHUB</div>

        {/* User info */}
        <div className="mb-8">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full ghost-border bg-[rgba(255,255,255,0.08)] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{userName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-white font-semibold font-body text-[0.875rem]">{userName}</p>
              <p className="text-white/40 text-[10px] font-label uppercase tracking-[0.1em] mt-0.5">{userRole} • {portalLabel}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1 relative">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-left ${
                  isActive
                    ? "text-white bg-[rgba(255,255,255,0.05)] font-semibold"
                    : "text-white/50 hover:text-white/80 hover:bg-[rgba(255,255,255,0.05)]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-sm font-sans tracking-tight flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto flex flex-col gap-1 ghost-border-t pt-6">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 text-white/40 hover:text-white transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="text-sm font-sans tracking-tight">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
