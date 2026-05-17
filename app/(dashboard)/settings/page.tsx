"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "next-themes";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Profile updated successfully");
    setSaving(false);
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2 mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full md:w-56 shrink-0"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </motion.aside>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 md:p-8"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Profile</h2>
                <p className="text-zinc-500 mt-1 text-sm">Update your personal information.</p>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center text-3xl font-bold">
                  {(session?.user?.name || "S")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{session?.user?.name || "User"}</p>
                  <p className="text-zinc-500 text-sm">{session?.user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Display Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-zinc-900 border-zinc-800"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Email Address</label>
                  <Input
                    value={session?.user?.email || ""}
                    disabled
                    className="h-12 rounded-xl bg-zinc-900 border-zinc-800 opacity-60"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="h-11 px-6 rounded-xl bg-white text-black font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Appearance</h2>
                <p className="text-zinc-500 mt-1 text-sm">Customize how SyncNotes looks.</p>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-4 block">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 ${
                        theme === value
                          ? "border-white bg-zinc-900"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-zinc-500 mt-1 text-sm">Control your notification preferences.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "AI generation complete", desc: "Get notified when AI finishes analyzing your notes" },
                  { label: "Weekly digest", desc: "Receive a weekly summary of your productivity" },
                  { label: "Shared note views", desc: "Know when someone views your shared notes" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-900 bg-zinc-900/40">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="w-10 h-6 rounded-full bg-white relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-black" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Security</h2>
                <p className="text-zinc-500 mt-1 text-sm">Manage your account security.</p>
              </div>
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/40">
                  <h3 className="font-semibold mb-1">Authentication Method</h3>
                  <p className="text-sm text-zinc-500">
                    {session?.user?.email?.includes("google") ? "Google OAuth" : "Email & Password"}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/40">
                  <h3 className="font-semibold mb-1">Active Sessions</h3>
                  <p className="text-sm text-zinc-500">1 active session on this device</p>
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  variant="destructive"
                  className="h-11 px-6 rounded-xl"
                >
                  Sign Out of All Devices
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
