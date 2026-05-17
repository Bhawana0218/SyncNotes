"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Image from "next/image";
import Logo from '@/public/Logo.png';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r border-zinc-900 bg-zinc-950/50 backdrop-blur-xl flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-zinc-900">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-25 h-25 rounded-xl flex items-center justify-center shrink-0 mt-2">
           <Image src={Logo} alt="SyncImage Logo"/>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">SyncNotes</h1>
            <p className="text-[12px] text-zinc-500 leading-none mt-0.5">AI Workspace</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group text-sm font-medium",
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10", isActive ? "text-black" : "")} />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-900">
        <div className="rounded-2xl bg-zinc-900/60 p-3.5">
          <div className="flex items-center gap-2 mb-1">
           <Image src={Logo} alt="SyncImage Logo" height={100} width={100}/>
            <p className="text-sm font-semibold text-zinc-300">SyncNotes AI</p>
          </div>
          <p className="text-[12px] text-zinc-500 leading-relaxed">
            Press ⌘J in any note to generate AI insights instantly.
          </p>
        </div>
      </div>
    </aside>
  );
}
