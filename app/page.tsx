import Link from "next/link";
import type { Metadata } from "next";
import {
  Zap,
  BrainCircuit,
  Share2,
  Search,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Logo from '@/public/Logo.png';

export const metadata: Metadata = {
  title: "SyncNotes — AI-Powered Notes Workspace",
  description:
    "Create, organize, and share intelligent notes with AI-powered summaries, action items, and smart tags. The modern workspace for productive thinkers.",
  openGraph: {
    title: "SyncNotes — AI-Powered Notes Workspace",
    description: "Create, organize, and share intelligent notes with AI-powered insights.",
    type: "website",
  },
};

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    desc: "Generate summaries, extract action items, and get smart tags with one click.",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find any note instantly with full-text search and tag filtering.",
  },
  {
    icon: Share2,
    title: "Public Sharing",
    desc: "Share notes publicly with a clean, shareable link — no login required.",
  },
  {
    icon: BarChart3,
    title: "Productivity Dashboard",
    desc: "Track your writing habits, AI usage, and weekly activity at a glance.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "Your notes are private by default. Share only what you choose.",
  },
  {
    icon: Zap,
    title: "Auto-Save",
    desc: "Never lose a thought. Notes save automatically as you type.",
  },
];

const highlights = [
  "AI summaries & action items",
  "Smart tag generation",
  "Full-text search",
  "Public share links",
  "Rich text editor",
  "Productivity insights",
  "Google OAuth",
  "Dark mode",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl  flex items-center justify-center">
             <Image src={Logo} alt="SyncImage Logo"/>
          </div>
          <span className="text-lg font-bold">SyncNotes</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
            <Sparkles className="w-4 h-4" />
            Powered by GPT-4o mini
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            The AI Workspace
            <br />
            <span className="text-zinc-400">Built for Modern Thinking</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Create, organize, summarize, and share intelligent notes with AI-powered workflows.
            Your thoughts, amplified.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] transition text-base"
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-zinc-700 hover:bg-zinc-900 transition text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {highlights.map((h) => (
              <div
                key={h}
                className="flex items-center gap-1.5 text-xs text-zinc-500"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                {h}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App preview mockup */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-6 rounded-lg bg-zinc-800 flex items-center px-3">
                <span className="text-xs text-zinc-500">syncnotes.app/dashboard</span>
              </div>
            </div>
            {/* Fake UI */}
            <div className="flex h-64 md:h-80">
              {/* Sidebar */}
              <div className="w-48 border-r border-zinc-800 p-3 space-y-2">
                {["Dashboard", "Notes", "Archive", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className={`h-8 rounded-xl flex items-center px-3 text-xs ${
                      i === 1 ? "bg-white text-black font-medium" : "text-zinc-500"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Notes list */}
              <div className="w-56 border-r border-zinc-800 p-3 space-y-2">
                {["Sprint Planning", "Meeting Notes", "Product Ideas", "Research"].map((t, i) => (
                  <div
                    key={t}
                    className={`p-2.5 rounded-xl border text-xs ${
                      i === 0
                        ? "border-white bg-white text-black"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <p className="font-medium">{t}</p>
                    <p className="text-[10px] mt-0.5 opacity-60">Updated recently</p>
                  </div>
                ))}
              </div>
              {/* Editor */}
              <div className="flex-1 p-4 space-y-3">
                <div className="h-6 bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-zinc-900 rounded w-full" />
                <div className="h-3 bg-zinc-900 rounded w-4/5" />
                <div className="h-3 bg-zinc-900 rounded w-3/4" />
                <div className="mt-4 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400 font-medium">AI Summary</span>
                  </div>
                  <div className="h-2.5 bg-zinc-800 rounded w-full mb-1.5" />
                  <div className="h-2.5 bg-zinc-800 rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to think better
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              SyncNotes combines a powerful editor with AI capabilities to help you capture,
              organize, and act on your ideas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to think smarter?</h2>
          <p className="text-zinc-400">
            Join SyncNotes and start building your AI-powered knowledge base today.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] transition text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg  flex items-center justify-center">
               <Image src={Logo} alt="SyncImage Logo"/>
            </div>
            <span className="text-sm font-semibold">SyncNotes</span>
          </div>
          <p className="text-xs text-zinc-400">
            All right are reserved · 2026
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
