'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Stars,
  Users,
} from "lucide-react";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import { motion } from "framer-motion";

interface AiResultType {
  summary: string;
  tasks: string[];
  tags: string[];
}

interface FeatureType {
  icon: React.ElementType;
  title: string;
  desc: string;
  gradient: string;
  borderHover: string;
}

interface StatType {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface TestimonialType {
  role: string;
  text: string;
  avatar: string;
  gradient: string;
}

interface AiActionType {
  label: string;
  icon: React.ElementType;
  color: string;
}

const features: FeatureType[] = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Insights",
    desc: "Generate summaries, extract action items, and get smart tags with one click.",
    gradient: "from-violet-500/20 to-purple-500/20",
    borderHover: "hover:border-violet-500/40",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Find any note instantly with full-text search and tag filtering.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderHover: "hover:border-blue-500/40",
  },
  {
    icon: Share2,
    title: "Public Sharing",
    desc: "Share notes publicly with a clean, shareable link.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderHover: "hover:border-emerald-500/40",
  },
  {
    icon: BarChart3,
    title: "Productivity Dashboard",
    desc: "Track your writing habits and AI usage.",
    gradient: "from-orange-500/20 to-amber-500/20",
    borderHover: "hover:border-orange-500/40",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "Your notes are private by default. End-to-end encryption available.",
    gradient: "from-rose-500/20 to-pink-500/20",
    borderHover: "hover:border-rose-500/40",
  },
  {
    icon: Zap,
    title: "Auto-Save",
    desc: "Never lose a thought while typing. Real-time sync across devices.",
    gradient: "from-yellow-500/20 to-orange-500/20",
    borderHover: "hover:border-yellow-500/40",
  },
];

const highlights = [
  "AI summaries & action items",
  "Smart tag generation",
  "Full-text search",
  "Public share links",
  "Rich text editor",
  "Dark mode",
];

const aiActions: AiActionType[] = [
  { label: "Summarize", icon: Stars, color: "text-violet-400" },
  { label: "Extract Tasks", icon: CheckCircle2, color: "text-emerald-400" },
  { label: "Generate Tags", icon: Share2, color: "text-blue-400" },
  { label: "Improve Title", icon: Zap, color: "text-amber-400" },
];

const testimonials: TestimonialType[] = [
  {
    role: "Product Designer",
    text: "Feels like Notion + ChatGPT had a baby. Extremely clean UX and the AI suggestions are spot-on.",
    avatar: "PD",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    role: "Full Stack Dev",
    text: "This is literally production-level SaaS architecture. The codebase quality is exceptional.",
    avatar: "FS",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    role: "Startup Founder",
    text: "I would actually pay for this product today. It saves me at least 2 hours per week on note management.",
    avatar: "SF",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const stats: StatType[] = [
  { label: "AI Notes Generated", value: "10K+", icon: Sparkles },
  { label: "Active Users", value: "2.4K+", icon: Users },
  { label: "Productivity Boost", value: "+68%", icon: BarChart3 },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

export default function HomePage() {
  const [aiInput, setAiInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<AiResultType | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAiProcess = () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setAiResult({
        summary: "Key insights extracted successfully from your notes.",
        tasks: ["Review project timeline", "Update documentation", "Schedule follow-up"],
        tags: ["productivity", "planning", "ai"],
      });
      setIsProcessing(false);
    }, 1500);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Gradient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-transparent blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-600/15 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-80 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 border-b border-border transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-xl shadow-lg shadow-violet-500/5" : "bg-background/80 backdrop-blur-xl"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
            <Image src={Logo} alt="SyncNotes Logo" width={80} height={80} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            SyncNotes
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 text-center relative">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-sm"
            variants={fadeInUp}
          >
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent font-medium">
              AI-powered SaaS productivity platform for modern thinkers
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            variants={fadeInUp}
          >
            The AI Workspace
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Built for Modern Thinking
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Create, organize, summarize, and share intelligent notes with AI-powered workflows.
            Your thoughts, amplified.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={fadeInUp}
          >
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105"
            >
              Start for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Highlights */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 pt-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {highlights.map((h) => (
              <motion.div
                key={h}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                variants={fadeInUp}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {h}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* MOCK APP PREVIEW */}
      <motion.section
        className="px-6 pb-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-violet-500/20 bg-card overflow-hidden shadow-2xl shadow-violet-500/10 ring-1 ring-violet-500/10">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 h-7 rounded-lg bg-background/80 flex items-center px-3 border border-border/50">
                <span className="text-xs text-muted-foreground">
                  syncnotes.app/dashboard
                </span>
              </div>
            </div>

            {/* UI mock */}
            <div className="flex h-72 md:h-96">
              {/* Sidebar */}
              <div className="w-44 border-r border-border p-3 space-y-1.5 bg-muted/20">
                {["Dashboard", "Notes", "Archive", "Settings"].map((item, i) => (
                  <div
                    key={item}
                    className={`h-9 rounded-xl flex items-center px-3 text-xs ${
                      i === 1
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium shadow-md shadow-violet-500/20"
                        : "text-muted-foreground hover:bg-muted/50 transition"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Notes list */}
              <div className="w-52 border-r border-border p-3 space-y-2 bg-muted/10">
                {[
                  "Sprint Planning",
                  "Meeting Notes",
                  "Product Ideas",
                  "Research",
                ].map((t, i) => (
                  <div
                    key={t}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      i === 0
                        ? "border-violet-500/40 bg-violet-500/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-violet-500/20 hover:bg-violet-500/5"
                    }`}
                  >
                    <p className="font-medium">{t}</p>
                    <p className="text-[10px] mt-0.5 opacity-60">Updated 2m ago</p>
                  </div>
                ))}
              </div>

              {/* Editor */}
              <div className="flex-1 p-5 space-y-3 bg-background">
                <div className="h-7 bg-gradient-to-r from-violet-500/20 to-transparent rounded-lg w-2/5" />
                <div className="h-3 bg-muted rounded-lg w-full" />
                <div className="h-3 bg-muted rounded-lg w-4/5" />
                <div className="h-3 bg-muted rounded-lg w-3/4" />

                <div className="mt-5 p-4 rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                    <span className="text-xs text-violet-300 font-medium">
                      AI Summary
                    </span>
                  </div>
                  <div className="h-2.5 bg-violet-500/20 rounded-lg w-full mb-2" />
                  <div className="h-2.5 bg-violet-500/20 rounded-lg w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* TRUST STRIP */}
      <motion.section
        className="px-6 pb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="rounded-2xl border border-border bg-card/80 p-5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {item.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {item.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* AI DEMO INTERACTION SECTION */}
      <motion.section
        className="px-6 py-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto rounded-3xl border border-violet-500/20 bg-gradient-to-br from-card via-card to-violet-500/5 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-violet-600/30 via-transparent to-purple-600/30 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm">
              <BrainCircuit className="w-4 h-4 text-violet-400" />
              <span className="text-violet-300">Live AI Engine Inside SyncNotes</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold">
              Turn any messy thought into{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                structured intelligence
              </span>
            </h2>

            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI automatically summarizes, extracts action items, and generates smart tags in real-time while you write.
            </p>

            {/* Demo input */}
            <div className="max-w-xl mx-auto mt-8">
              <div className="flex items-center gap-2 p-2 rounded-2xl border border-violet-500/30 bg-background shadow-lg shadow-violet-500/5 focus-within:border-violet-500/60 focus-within:shadow-violet-500/10 transition-all">
                <BrainCircuit className="w-5 h-5 text-violet-400 ml-2" />
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Write something like: Meeting notes, startup idea, study plan..."
                  className="flex-1 bg-transparent outline-none px-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleAiProcess}
                  disabled={isProcessing || !aiInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Run AI ✨"
                  )}
                </button>
              </div>

              {/* AI Result */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-2xl border border-violet-500/30 bg-violet-500/5 text-left space-y-3"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium text-violet-300">AI Results</span>
                  </div>
                  <p className="text-sm text-foreground">{aiResult.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.tasks.map((t: string) => (
                      <span key={t} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {aiResult.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* AI Action Chips */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {aiActions.map((a) => {
                const Icon = a.icon;
                return (
                  <div
                    key={a.label}
                    className="px-4 py-2 rounded-full bg-muted border border-border hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Icon className={`w-3.5 h-3.5 ${a.color}`} />
                    {a.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                think better
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              SyncNotes combines AI and productivity tools into one seamless workspace.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className={`rounded-3xl border border-border bg-card/80 p-7 hover:bg-muted ${feature.borderHover} hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
                  variants={fadeInUp}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <motion.section
        className="px-6 py-20 border-t border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-4xl font-bold">
            Loved by{" "}
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              modern builders
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.role}
                className="p-7 rounded-3xl border border-border bg-card/80 text-left hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Stars key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{t.text}"
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                  >
                    {t.avatar}
                  </div>
                  <p className="text-xs font-medium text-violet-300">
                    — {t.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="px-6 py-24 border-t border-border text-center relative"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto space-y-6 relative">
          <h2 className="text-4xl md:text-5xl font-bold">
            Start building your{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI brain
            </span>{" "}
            today
          </h2>
          <p className="text-muted-foreground text-lg">
            Join developers and creators using SyncNotes as their second brain.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:shadow-violet-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl border border-border hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              View Dashboard
            </Link>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            No credit card required · Free forever plan available · Setup in 30 seconds
          </p>
        </div>
      </motion.section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <Image src={Logo} alt="SyncNotes Logo" width={56} height={56} />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              SyncNotes
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 SyncNotes. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-violet-400 transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-violet-400 transition">
              Register
            </Link>
            <Link href="/privacy" className="hover:text-violet-400 transition">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
