"use client";

import { Bell, Menu, X} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { SearchCommand } from "@/components/dashboard/Search-Command";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/Logo.png";

export function TopNavbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SN";

  return (
    <>
      <header className="h-14 border-b border-zinc-900 bg-black/60 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0 z-40">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
             <Image src={Logo} alt="SyncImage Logo"/>
            </div>
            
            <span className="font-bold text-sm">SyncNotes</span>
          </Link>
        </div>

        {/* Desktop: search */}
        <div className="hidden md:flex flex-1">
          <SearchCommand />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <button className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition relative">
            <Bell className="w-4 h-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl hover:bg-zinc-900 p-1.5 transition">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="text-xs bg-zinc-800 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                  {session?.user?.name || "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-950 border-zinc-800 text-white rounded-2xl w-52"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{session?.user?.name || "User"}</p>
                  <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-400 focus:text-red-400 cursor-pointer"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6 px-1">
              <div className="w-8 h-8 rounded-x flex items-center justify-center">
                <Image src={Logo} alt="SyncImage Logo"/>
              </div>
              <div>
                <h1 className="text-sm font-bold">SyncNotes</h1>
                <p className="text-[10px] text-zinc-500">AI Workspace</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-white text-black"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    )}
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
