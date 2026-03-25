import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}

export function GlassCard({ children, hover = true, className = "" }: GlassCardProps) {
  return (
    <div
      className={`glass-card ghost-border rounded-xl p-6 ${hover ? "hover:bg-[rgba(255,255,255,0.05)] transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
