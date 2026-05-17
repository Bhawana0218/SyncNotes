"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Palette, LogOut, Save,
  Moon, Sun, Monitor, Check, ChevronRight,
  Mail, Lock, Smartphone, Eye, EyeOff, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/providers/theme-provider";
import { useSession, signOut } from "next-auth/react";

/* ── Types ── */
type TabId = "profile" | "appearance" | "notifications" | "security";

const TABS: { id: TabId; label: string; icon: any; desc: string }[] = [
  { id: "profile",       label: "Profile",       icon: User,    desc: "Personal info & avatar" },
  { id: "appearance",    label: "Appearance",    icon: Palette, desc: "Theme & display" },
  { id: "notifications", label: "Notifications", icon: Bell,    desc: "Alerts & digests" },
  { id: "security",      label: "Security",      icon: Shield,  desc: "Password & sessions" },
];

/* ── Reusable section wrapper ── */
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
        {desc && <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Field wrapper ── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
      {hint && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
      style={{ background: checked ? "var(--primary)" : "var(--surface-3)" }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full transition-all duration-200"
        style={{
          background: "#fff",
          left: checked ? "calc(100% - 20px)" : "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Notification toggles
  const [notifs, setNotifs] = useState({
    aiComplete: true,
    weeklyDigest: true,
    sharedViews: false,
  });

  useEffect(() => {
    setMounted(true);
    if (session?.user?.name) setName(session.user.name);
  }, [session?.user?.name]);

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Profile updated");
    setSaving(false);
  }

  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "dark";

  return (
    <div className="min-h-full" style={{ background: "var(--background)" }}>
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Manage your account, appearance, and preferences.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left nav ── */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:w-56 shrink-0"
          >
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                    style={active
                      ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                      : { color: "var(--text-secondary)" }
                    }
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                );
              })}

              <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{ color: "#ef4444" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </nav>
          </motion.aside>

          {/* ── Right panel ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl p-6 md:p-8"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
              >

                {/* ── PROFILE ── */}
                {activeTab === "profile" && (
                  <Section title="Profile" desc="Update your display name and view account details.">
                    {/* Avatar row */}
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                      >
                        {(session?.user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {session?.user?.name || "User"}
                        </p>
                        <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Field label="Display Name">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="w-full h-10 px-3.5 rounded-xl text-sm outline-none transition"
                          style={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            color: "var(--text-primary)",
                          }}
                          onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--primary)"; }}
                          onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border)"; }}
                        />
                      </Field>

                      <Field label="Email Address" hint="Email cannot be changed.">
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
                          <input
                            value={session?.user?.email || ""}
                            disabled
                            className="w-full h-10 pl-9 pr-3.5 rounded-xl text-sm"
                            style={{
                              background: "var(--surface-3)",
                              border: "1px solid var(--border)",
                              color: "var(--text-muted)",
                              cursor: "not-allowed",
                            }}
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="h-9 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition hover:opacity-90"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                      >
                        {saving
                          ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                          : <><Save className="w-4 h-4" />Save Changes</>}
                      </button>
                    </div>
                  </Section>
                )}

                {/* ── APPEARANCE ── */}
                {activeTab === "appearance" && (
                  <Section title="Appearance" desc="Choose how SyncNotes looks on your device.">
                    <div className="space-y-3">
                      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light",  label: "Light",  icon: Sun,     preview: ["#f5f5fa", "#ffffff", "#7c3aed"] },
                          { value: "dark",   label: "Dark",   icon: Moon,    preview: ["#0a0a0f", "#111118", "#8b5cf6"] },
                          { value: "system", label: "System", icon: Monitor, preview: ["#7c3aed", "#0a0a0f", "#f5f5fa"] },
                        ].map(({ value, label, icon: Icon, preview }) => {
                          const active = theme === value;
                          return (
                            <button
                              key={value}
                              onClick={() => setTheme(value)}
                              className="relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                              style={active
                                ? {
                                    background: "var(--accent)",
                                    border: "2px solid var(--primary)",
                                    boxShadow: "0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)",
                                  }
                                : {
                                    background: "var(--surface-2)",
                                    border: "1px solid var(--border)",
                                  }
                              }
                            >
                              {/* Mini preview */}
                              <div className="w-full h-10 rounded-lg overflow-hidden flex"
                                style={{ border: "1px solid var(--border)" }}>
                                <div className="w-1/3 h-full" style={{ background: preview[0] }} />
                                <div className="w-1/3 h-full" style={{ background: preview[1] }} />
                                <div className="w-1/3 h-full" style={{ background: preview[2] }} />
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Icon className="w-4 h-4" style={{ color: active ? "var(--primary-light)" : "var(--text-muted)" }} />
                                <span className="text-sm font-medium" style={{ color: active ? "var(--primary-light)" : "var(--text-secondary)" }}>
                                  {label}
                                </span>
                              </div>

                              {active && (
                                <div
                                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ background: "var(--primary)" }}
                                >
                                  <Check className="w-3 h-3" style={{ color: "var(--primary-foreground)" }} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {mounted && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Currently using: <span style={{ color: "var(--primary-light)" }}>{currentTheme} mode</span>
                        </p>
                      )}
                    </div>
                  </Section>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === "notifications" && (
                  <Section title="Notifications" desc="Control which alerts and digests you receive.">
                    <div className="space-y-3">
                      {[
                        {
                          key: "aiComplete" as const,
                          icon: Smartphone,
                          label: "AI generation complete",
                          desc: "Get notified when AI finishes analyzing your notes",
                        },
                        {
                          key: "weeklyDigest" as const,
                          icon: Mail,
                          label: "Weekly productivity digest",
                          desc: "A weekly summary of your notes and AI usage",
                        },
                        {
                          key: "sharedViews" as const,
                          icon: Eye,
                          label: "Shared note views",
                          desc: "Know when someone opens your public share links",
                        },
                      ].map(({ key, icon: Icon, label, desc }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-xl transition"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: "var(--accent)" }}
                            >
                              <Icon className="w-4 h-4" style={{ color: "var(--primary-light)" }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{desc}</p>
                            </div>
                          </div>
                          <Toggle
                            checked={notifs[key]}
                            onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))}
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* ── SECURITY ── */}
                {activeTab === "security" && (
                  <Section title="Security" desc="Manage your authentication and active sessions.">
                    <div className="space-y-3">
                      {/* Auth method */}
                      <div
                        className="flex items-center gap-4 p-4 rounded-xl"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "var(--accent)" }}
                        >
                          <Lock className="w-5 h-5" style={{ color: "var(--primary-light)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            Authentication Method
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {session?.user?.image ? "Google OAuth (SSO)" : "Email & Password"}
                          </p>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
                        >
                          Active
                        </span>
                      </div>

                      {/* Change password (email users only) */}
                      {!session?.user?.image && (
                        <div
                          className="p-4 rounded-xl space-y-3"
                          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        >
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            Change Password
                          </p>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="New password"
                              className="w-full h-10 px-3.5 pr-10 rounded-xl text-sm outline-none"
                              style={{
                                background: "var(--surface-3)",
                                border: "1px solid var(--border)",
                                color: "var(--text-primary)",
                              }}
                              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--primary)"; }}
                              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border)"; }}
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <button
                            className="h-9 px-4 rounded-xl text-sm font-medium transition hover:opacity-90"
                            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            onClick={() => toast.info("Password change coming soon")}
                          >
                            Update Password
                          </button>
                        </div>
                      )}

                      {/* Active sessions */}
                      <div
                        className="flex items-center gap-4 p-4 rounded-xl"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "var(--accent)" }}
                        >
                          <Smartphone className="w-5 h-5" style={{ color: "var(--primary-light)" }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            Active Sessions
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            1 session — this device
                          </p>
                        </div>
                      </div>

                      {/* Danger zone */}
                      <div
                        className="p-4 rounded-xl space-y-3"
                        style={{
                          background: "rgba(239,68,68,0.05)",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }}
                      >
                        <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>Danger Zone</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          This will sign you out of all active sessions immediately.
                        </p>
                        <button
                          onClick={() => signOut({ callbackUrl: "/login" })}
                          className="h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out of All Devices
                        </button>
                      </div>
                    </div>
                  </Section>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
