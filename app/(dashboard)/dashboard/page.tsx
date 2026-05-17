"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FileText, Sparkles, BrainCircuit, Activity,
  TrendingUp, TrendingDown, Minus, ArrowRight, Clock, Tag, CalendarDays, Bell,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductivityInsights } from "@/components/dashboard/Productivity-Insights";
import { useRemindersStore, getReminderTypeConfig } from "@/store/use-reminders-store";

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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function StatCard({
  title, value, icon: Icon, trend, trendValue, accent,
}: {
  title: string; value: string | number; icon: any;
  trend?: "up" | "down" | "neutral"; trendValue?: string; accent?: boolean;
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "var(--text-muted)";

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: accent ? "linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)" : "var(--surface-1)",
        border: accent ? "none" : "1px solid var(--border)",
        boxShadow: accent ? "0 4px 24px rgba(124,58,237,0.3)" : "none",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
            {title}
          </p>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: accent ? "#fff" : "var(--text-primary)" }}>
            {value}
          </h2>
          {trendValue && (
            <div className="flex items-center gap-1 text-xs" style={{ color: accent ? "rgba(255,255,255,0.7)" : trendColor }}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? "rgba(255,255,255,0.2)" : "var(--surface-3)" }}
        >
          <Icon className="w-5 h-5" style={{ color: accent ? "#fff" : "var(--primary-light)" }} />
        </div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-sm shadow-xl"
        style={{ background: "var(--popover)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
        <p style={{ color: "var(--text-muted)" }}>{payload[0]?.payload?.date || label}</p>
        <p className="font-semibold">{payload[0].value} notes</p>
      </div>
    );
  }
  return null;
};

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72 rounded-2xl" />
        <Skeleton className="h-4 w-48 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Skeleton className="xl:col-span-2 h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { reminders } = useRemindersStore();

  useEffect(() => {
    axios.get("/api/dashboard/stats")
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (!stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <BrainCircuit className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Failed to load dashboard</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Please refresh the page</p>
        </div>
      </div>
    );
  }

  const growthTrend: "up" | "down" | "neutral" =
    stats.weeklyGrowth > 0 ? "up" : stats.weeklyGrowth < 0 ? "down" : "neutral";

  const cards: { title: string; value: string | number; icon: any; trendValue: string; trend: "up" | "down" | "neutral"; accent?: boolean }[] = [
    { title: "Total Notes", value: stats.totalNotes, icon: FileText, trendValue: "all time", trend: "neutral" },
    { title: "AI Enhanced", value: stats.aiGeneratedNotes, icon: Sparkles, trendValue: `${stats.totalNotes > 0 ? Math.round((stats.aiGeneratedNotes / stats.totalNotes) * 100) : 0}% of notes`, trend: "up", accent: true },
    { title: "Weekly Growth", value: `${stats.weeklyGrowth > 0 ? "+" : ""}${stats.weeklyGrowth}%`, icon: TrendingUp, trendValue: "vs last week", trend: growthTrend },
    { title: "AI Score", value: `${stats.productivityScore}%`, icon: BrainCircuit, trendValue: "AI adoption rate", trend: stats.productivityScore > 50 ? "up" : "neutral" },
  ];

  const upcomingReminders = reminders
    .filter((r) => !r.completed && new Date(r.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <TooltipProvider>
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
                AI Productivity Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Insights into your intelligent workspace.
              </p>
            </div>
            {upcomingReminders.length > 0 && (
              <Link href="/calendar"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition"
                style={{ background: "var(--accent)", color: "var(--primary-light)", border: "1px solid var(--border)" }}>
                <Bell className="w-3.5 h-3.5" />
                {upcomingReminders.length} upcoming reminder{upcomingReminders.length > 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => <StatCard key={card.title} {...card} />)}
        </motion.div>

        {/* Chart + Tags — now with Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* Chart */}
          <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Weekly Activity</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Notes created in the last 7 days</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs"
                style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                <Activity className="w-3.5 h-3.5" style={{ color: "var(--primary-light)" }} />
                Live
              </div>
            </div>

            {stats.weeklyActivity.every((d) => d.notes === 0) ? (
              <div className="h-[260px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No activity this week yet</p>
                  <Link href="/notes" className="text-xs mt-1 inline-flex items-center gap-1 transition"
                    style={{ color: "var(--primary-light)" }}>
                    Create your first note <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyActivity} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-stroke)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--chart-stroke)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="day" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="notes"
                      stroke="var(--chart-stroke)" fill="url(#colorNotes)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--chart-stroke)", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "var(--chart-stroke)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tags + Reminders — Tabs */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <Tabs defaultValue="tags">
              <div className="px-4 pt-4 pb-0">
                <TabsList className="w-full" style={{ background: "var(--surface-3)" }}>
                  <TabsTrigger value="tags" className="flex-1 text-xs">
                    <Tag className="w-3.5 h-3.5 mr-1" />Tags
                  </TabsTrigger>
                  <TabsTrigger value="reminders" className="flex-1 text-xs">
                    <CalendarDays className="w-3.5 h-3.5 mr-1" />Reminders
                    {upcomingReminders.length > 0 && (
                      <Badge className="ml-1 h-4 px-1 text-[9px]" style={{ background: "var(--primary)", color: "#fff" }}>
                        {upcomingReminders.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="tags" className="p-4 pt-3">
                {stats.mostUsedTags.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Tag className="w-8 h-8 mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No tags yet</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Generate AI insights to create tags</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.mostUsedTags.map(([tag, count], i) => (
                      <motion.div key={tag}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl transition"
                        style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
                      >
                        <span className="text-sm font-medium" style={{ color: "var(--primary-light)" }}>#{tag}</span>
                        <Badge variant="outline" className="text-[10px] border-0"
                          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>
                          {count}×
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reminders" className="p-4 pt-3">
                {upcomingReminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CalendarDays className="w-8 h-8 mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>No upcoming reminders</p>
                    <Link href="/calendar" className="text-xs mt-2 flex items-center gap-1"
                      style={{ color: "var(--primary-light)" }}>
                      Open Calendar <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingReminders.map((r) => {
                      const cfg = getReminderTypeConfig(r.type);
                      return (
                        <div key={r.id} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                          style={{ background: "var(--surface-3)", border: `1px solid ${cfg.color}33` }}>
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: cfg.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{r.title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                              {format(new Date(r.date), "EEE, MMM d · h:mm a")}
                            </p>
                          </div>
                          <Badge className="text-[9px] h-4 px-1.5 shrink-0 border-0"
                            style={{ background: `${cfg.color}22`, color: cfg.color }}>
                            {cfg.label}
                          </Badge>
                        </div>
                      );
                    })}
                    <Link href="/calendar"
                      className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-medium transition mt-1"
                      style={{ color: "var(--primary-light)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />View all in Calendar
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Recent Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-2xl p-6" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Recent Notes</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Your latest workspace activity</p>
            </div>
            <Link href="/notes" className="flex items-center gap-1 text-xs font-medium transition"
              style={{ color: "var(--primary-light)" }}>
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="w-10 h-10 mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notes yet</p>
              <Link href="/notes"
                className="mt-3 px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                Create your first note
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentNotes.map((note: any, i) => (
                <motion.div key={note.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}>
                  <Link href="/notes"
                    className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "var(--accent)" }}>
                        <FileText className="w-4 h-4" style={{ color: "var(--primary-light)" }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                          {note.title || "Untitled"}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {note.summary && (
                        <Badge className="text-[10px] h-5 px-2 border-0 badge-ai">AI</Badge>
                      )}
                      {note.tags?.length > 0 && (
                        <Badge variant="outline" className="text-[10px] h-5 px-2 border-0"
                          style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}>
                          {note.tags.length} tags
                        </Badge>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 transition-colors" style={{ color: "var(--text-muted)" }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <ProductivityInsights
          notes={stats.recentNotes}
          aiGeneratedNotes={stats.aiGeneratedNotes}
          totalNotes={stats.totalNotes}
          mostUsedTags={stats.mostUsedTags}
        />
      </div>
    </TooltipProvider>
  );
}
