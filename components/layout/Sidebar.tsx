"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/public/Logo.png";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-64 flex-col shrink-0 border-r"
      style={{
        background: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="h-16 flex items-center px-4 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
            <Image src={Logo} alt="SyncNotes Logo" width={86} height={86} className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none" style={{ color: "var(--text-primary)" }}>
              SyncNotes
            </h1>
            <p className="text-[13px] leading-none mt-0.5" style={{ color: "var(--text-muted)" }}>
              AI Workspace
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: "var(--text-muted)" }}>
          Menu
        </p>
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group"
                )}
                style={
                  isActive
                    ? {
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      boxShadow: "0 2px 12px rgba(124,58,237,0.35)",
                    }
                    : {
                      color: "var(--text-secondary)",
                    }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "var(--primary)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{ background: "var(--accent)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0"
          >
            <Image src={Logo} alt="SyncNotes" width={80} height={80} className="object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold" style={{ color: "var(--accent-foreground)" }}>
              AI Insights
            </p>
            <p className="text-[13px] leading-relaxed truncate" style={{ color: "var(--text-muted)" }}>
              Press ⌘J to generate
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
