"use client";

import { Bell, Menu, X, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { signOut, useSession } from "next-auth/react";
import { SearchCommand } from "@/components/dashboard/Search-Command";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import { useRemindersStore, getReminderTypeConfig } from "@/store/use-reminders-store";
import { format, isToday, isTomorrow } from "date-fns";
import axios from "axios";

function NotificationBell() {
  const { reminders, setReminders } = useRemindersStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios.get("/api/reminders?upcoming=true")
      .then((r) => setReminders(r.data))
      .catch(() => {});
  }, [setReminders]);

  const upcoming = reminders
    .filter((r) => !r.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  function formatReminderDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today · ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow · ${format(d, "h:mm a")}`;
    return format(d, "EEE, MMM d · h:mm a");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition"
          style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
        >
          <Bell className="w-4 h-4" />
          {upcoming.length > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              {upcoming.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0"
        style={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Upcoming Reminders</p>
          {upcoming.length > 0 && (
            <Badge className="text-[10px] h-4 px-1.5" style={{ background: "var(--primary)", color: "#fff" }}>
              {upcoming.length}
            </Badge>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="w-8 h-8 mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>No upcoming reminders</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {upcoming.map((r) => {
                const cfg = getReminderTypeConfig(r.type);
                return (
                  <div key={r.id} className="flex items-start gap-2.5 p-2 rounded-lg"
                    style={{ background: "var(--surface-2)" }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cfg.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {formatReminderDate(r.date)}
                      </p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${cfg.color}22`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Separator style={{ background: "var(--border)" }} />
        <div className="p-2">
          <Link
            href="/calendar"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium transition"
            style={{ color: "var(--primary-light)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            View Calendar
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TopNavbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SN";

  return (
    <>
      <header
        className="h-14 border-b px-4 md:px-6 flex items-center justify-between shrink-0 z-40 backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--sidebar-bg) 80%, transparent)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-20 h-20 rounded-xl flex items-center justify-center transition"
            style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src={Logo} alt="SyncNotes" width={48} height={48} className="object-contain" />
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>SyncNotes</span>
          </Link>
        </div>

        {/* Desktop: search */}
        <div className="hidden md:flex flex-1">
          <SearchCommand />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-xl p-1.5 transition"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="hidden sm:block text-sm font-medium max-w-[120px] truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {session?.user?.name || "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl w-52 shadow-xl"
              style={{
                background: "var(--popover)",
                borderColor: "var(--border)",
                color: "var(--popover-foreground)",
              }}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: "var(--border)" }} />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings" style={{ color: "var(--text-primary)" }}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: "var(--border)" }} />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="cursor-pointer text-red-500 focus:text-red-500"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 p-4 border-r"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-6 px-1">
              <Image src={Logo} alt="SyncNotes" width={32} height={32} className="object-contain" />
              <div>
                <h1 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>SyncNotes</h1>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>AI Workspace</p>
              </div>
            </div>

            <nav className="space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all")}
                    style={
                      isActive
                        ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                        : { color: "var(--text-secondary)" }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
