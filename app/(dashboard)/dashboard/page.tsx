"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  BrainCircuit,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  Tag,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Stats {
  totalNotes: number;
  aiGeneratedNotes: number;
  mostUsedTags: [string, number][];
  recentNotes: any[];
  weeklyActivity: { day: string; notes: number; date: string }[];
  weeklyGrowth: number;
  productivityScore: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  delay?: number;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-zinc-500";

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-zinc-500 text-sm font-medium">{title}</p>
          <h2 className="text-4xl font-bold tracking-tight">{value}</h2>
          {trendValue && (
            <div className={`flex items-center gap-1.5 text-xs ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {trendValue}
            </div>
          )}
        </div>
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center transition-colors duration-300">
          <Icon className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors duration-300" />
        </div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm">
        <p className="text-zinc-400">{payload[0]?.payload?.date || label}</p>
        <p className="text-white font-semibold">{payload[0].value} notes</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await axios.get("/api/dashboard/stats");
        setStats(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-10 bg-zinc-900 rounded-2xl w-80 animate-pulse" />
          <div className="h-5 bg-zinc-900 rounded-xl w-56 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="h-10 bg-zinc-800 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 animate-pulse h-80" />
          <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 animate-pulse h-80" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BrainCircuit className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Failed to load dashboard</h2>
          <p className="text-zinc-500 mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }

  const growthTrend: "up" | "down" | "neutral" =
    stats.weeklyGrowth > 0 ? "up" : stats.weeklyGrowth < 0 ? "down" : "neutral";

  const cards: {
    title: string;
    value: string | number;
    icon: any;
    trendValue: string;
    trend: "up" | "down" | "neutral";
  }[] = [
    {
      title: "Total Notes",
      value: stats.totalNotes,
      icon: FileText,
      trendValue: `${stats.totalNotes} total`,
      trend: "neutral" as const,
    },
    {
      title: "AI Enhanced",
      value: stats.aiGeneratedNotes,
      icon: Sparkles,
      trendValue: `${stats.totalNotes > 0 ? Math.round((stats.aiGeneratedNotes / stats.totalNotes) * 100) : 0}% of notes`,
      trend: "up" as const,
    },
    {
      title: "Weekly Growth",
      value: `${stats.weeklyGrowth > 0 ? "+" : ""}${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      trendValue: "vs last week",
      trend: growthTrend,
    },
    {
      title: "AI Score",
      value: `${stats.productivityScore}%`,
      icon: BrainCircuit,
      trendValue: "AI adoption rate",
      trend: stats.productivityScore > 50 ? ("up" as const) : ("neutral" as const),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          AI Productivity Dashboard
        </h1>
        <p className="text-zinc-400">Insights into your intelligent workspace.</p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5"
      >
        {cards.map((card, i) => (
          <StatCard key={card.title} {...card} delay={i * 0.1} />
        ))}
      </motion.div>

      {/* Chart + Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5"
      >
        {/* Weekly chart */}
        <div className="xl:col-span-2 rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold">Weekly Activity</h2>
              <p className="text-zinc-500 text-sm mt-0.5">Notes created in the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 text-xs text-zinc-400">
              <Activity className="w-3.5 h-3.5" />
              Live
            </div>
          </div>

          {stats.weeklyActivity.every((d) => d.notes === 0) ? (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No activity this week yet</p>
                <Link href="/notes" className="text-xs text-zinc-400 hover:text-white mt-1 inline-flex items-center gap-1 transition">
                  Create your first note <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyActivity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="day" stroke="#52525b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#52525b" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="notes"
                    stroke="#ffffff"
                    fill="url(#colorNotes)"
                    strokeWidth={2.5}
                    dot={{ fill: "#ffffff", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-xl font-bold">Smart Tags</h2>
              <p className="text-zinc-500 text-sm">Most used AI-generated tags</p>
            </div>
          </div>

          {stats.mostUsedTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-zinc-500 text-sm">No tags yet</p>
              <p className="text-zinc-600 text-xs mt-1">Generate AI insights to create tags</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats.mostUsedTags.map(([tag, count], i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <span className="text-sm font-medium">#{tag}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {count} {count === 1 ? "use" : "uses"}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Recent Notes</h2>
            <p className="text-zinc-500 text-sm mt-0.5">Your latest workspace activity</p>
          </div>
          <Link
            href="/notes"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {stats.recentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-zinc-500">No notes yet</p>
            <Link
              href="/notes"
              className="mt-3 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:scale-[1.02] transition"
            >
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentNotes.map((note: any, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <Link
                  href="/notes"
                  className="flex items-center justify-between p-4 rounded-2xl border border-zinc-900 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition-colors">
                      <FileText className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{note.title || "Untitled"}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <p className="text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {note.summary && (
                      <span className="px-2.5 py-1 rounded-full bg-white text-black text-xs font-medium">
                        AI
                      </span>
                    )}
                    {note.tags?.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-xs text-zinc-400">
                        {note.tags.length} tags
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
