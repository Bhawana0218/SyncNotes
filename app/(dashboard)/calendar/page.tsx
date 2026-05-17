"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, isSameDay, isSameMonth, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isToday, isPast, addMonths, subMonths,
} from "date-fns";
import {
  CalendarDays, Plus, Bell, Users, Clock, Sparkles,
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Trash2,
  Pencil, FileText, CalendarCheck, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReminderDialog } from "@/components/calendar/Reminder-Dialog";
import { useRemindersStore, getReminderTypeConfig, type Reminder } from "@/store/use-reminders-store";
import { useNotesStore } from "@/store/use-notes-store";

const TYPE_ICONS: Record<string, any> = {
  reminder: Bell,
  meeting: Users,
  deadline: Clock,
  event: Sparkles,
};

function ReminderBadge({ reminder, onClick }: { reminder: Reminder; onClick: () => void }) {
  const cfg = getReminderTypeConfig(reminder.type);
  const Icon = TYPE_ICONS[reminder.type] ?? Bell;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition hover:opacity-80"
            style={{
              background: `${cfg.color}22`,
              color: cfg.color,
              border: `1px solid ${cfg.color}44`,
              textDecoration: reminder.completed ? "line-through" : "none",
              opacity: reminder.completed ? 0.6 : 1,
            }}
          >
            <Icon className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{reminder.title}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{reminder.title}</p>
          <p className="text-xs opacity-70">{format(new Date(reminder.date), "h:mm a")} · {cfg.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editReminder, setEditReminder] = useState<Reminder | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { reminders, setReminders, updateReminder, removeReminder } = useRemindersStore();
  const { notes } = useNotesStore();

  const fetchReminders = useCallback(async (month: Date) => {
    try {
      setLoading(true);
      const monthStr = format(month, "yyyy-MM");
      const res = await axios.get(`/api/reminders?month=${monthStr}`);
      setReminders(res.data);
    } catch {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, [setReminders]);

  useEffect(() => { fetchReminders(currentMonth); }, [currentMonth, fetchReminders]);

  // Also fetch notes for linking
  useEffect(() => {
    if (notes.length === 0) {
      axios.get("/api/notes").then((r) => {
        // notes store is populated by sidebar, but fetch if empty
      }).catch(() => {});
    }
  }, [notes.length]);

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  function getRemindersForDay(day: Date) {
    return reminders.filter((r) => isSameDay(new Date(r.date), day));
  }

  const selectedDayReminders = selectedDay
    ? reminders.filter((r) => isSameDay(new Date(r.date), selectedDay))
    : [];

  const filteredSelected = filterType === "all"
    ? selectedDayReminders
    : selectedDayReminders.filter((r) => r.type === filterType);

  async function toggleComplete(reminder: Reminder) {
    try {
      const res = await axios.patch(`/api/reminders/${reminder.id}`, { completed: !reminder.completed });
      updateReminder(reminder.id, res.data);
    } catch {
      toast.error("Failed to update reminder");
    }
  }

  async function deleteReminder(id: string) {
    setDeletingId(id);
    try {
      await axios.delete(`/api/reminders/${id}`);
      removeReminder(id);
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    } finally {
      setDeletingId(null);
    }
  }

  function openCreate(day?: Date) {
    setEditReminder(null);
    if (day) setSelectedDay(day);
    setDialogOpen(true);
  }

  function openEdit(reminder: Reminder) {
    setEditReminder(reminder);
    setDialogOpen(true);
  }

  const upcomingReminders = reminders
    .filter((r) => !r.completed && new Date(r.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const totalThisMonth = reminders.length;
  const completedThisMonth = reminders.filter((r) => r.completed).length;

  return (
    <TooltipProvider>
      <div className="min-h-full" style={{ background: "var(--background)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "var(--accent)" }}>
                  <CalendarDays className="w-6 h-6" style={{ color: "var(--primary-light)" }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                    Calendar
                  </h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {totalThisMonth} reminders · {completedThisMonth} completed this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSheetOpen(true)}
                  variant="outline"
                  className="rounded-xl h-9 text-sm gap-2"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Upcoming</span>
                  {upcomingReminders.length > 0 && (
                    <Badge className="ml-1 h-4 px-1.5 text-[10px]" style={{ background: "var(--primary)", color: "#fff" }}>
                      {upcomingReminders.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  onClick={() => openCreate(selectedDay ?? new Date())}
                  className="rounded-xl h-9 text-sm gap-2 border-0 hover:opacity-90"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  <Plus className="w-4 h-4" />
                  New Reminder
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="xl:col-span-2 rounded-2xl overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              {/* Month nav */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                  style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {format(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                  style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--border)" }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              {loading ? (
                <div className="grid grid-cols-7 gap-px p-1" style={{ background: "var(--border)" }}>
                  {Array.from({ length: 35 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" style={{ background: "var(--surface-2)" }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-px" style={{ background: "var(--border)" }}>
                  {calendarDays.map((day) => {
                    const dayReminders = getRemindersForDay(day);
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isCurrentDay = isToday(day);
                    const isPastDay = isPast(day) && !isCurrentDay;

                    return (
                      <div
                        key={day.toISOString()}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedDay(day)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedDay(day); }}
                        className="min-h-[80px] p-1.5 flex flex-col gap-1 text-left transition-all duration-150 relative cursor-pointer group/day"
                        style={{
                          background: isSelected
                            ? "color-mix(in srgb, var(--primary) 12%, var(--surface-1))"
                            : "var(--surface-1)",
                          outline: isSelected ? `2px solid var(--primary)` : "none",
                          outlineOffset: "-2px",
                        }}
                      >
                        {/* Day number */}
                        <div className="flex items-center justify-between">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{
                              background: isCurrentDay ? "var(--primary)" : "transparent",
                              color: isCurrentDay
                                ? "#fff"
                                : !isCurrentMonth
                                ? "var(--text-muted)"
                                : isPastDay
                                ? "var(--text-muted)"
                                : "var(--text-primary)",
                            }}
                          >
                            {format(day, "d")}
                          </span>
                          {isCurrentMonth && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); openCreate(day); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); openCreate(day); } }}
                              className="w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover/day:opacity-60 hover:!opacity-100 transition-opacity cursor-pointer"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Plus className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Reminders */}
                        <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                          {dayReminders.slice(0, 3).map((r) => (
                            <ReminderBadge key={r.id} reminder={r} onClick={() => { setSelectedDay(day); openEdit(r); }} />
                          ))}
                          {dayReminders.length > 3 && (
                            <span className="text-[10px] px-1" style={{ color: "var(--text-muted)" }}>
                              +{dayReminders.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Day Detail Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl flex flex-col overflow-hidden"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              {/* Panel header */}
              <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                      {selectedDay ? format(selectedDay, "EEEE") : "Select a day"}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {selectedDay ? format(selectedDay, "MMMM d, yyyy") : "Click a day to view reminders"}
                    </p>
                  </div>
                  {selectedDay && (
                    <Button
                      onClick={() => openCreate(selectedDay)}
                      size="sm"
                      className="rounded-xl h-8 text-xs gap-1.5 border-0 hover:opacity-90"
                      style={{ background: "var(--primary)", color: "#fff" }}
                    >
                      <Plus className="w-3.5 h-3.5" />Add
                    </Button>
                  )}
                </div>

                {selectedDayReminders.length > 0 && (
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-7 text-xs rounded-lg w-full" style={{ background: "var(--surface-3)", borderColor: "var(--border)", color: "var(--text-secondary)" }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="reminder">🔔 Reminders</SelectItem>
                      <SelectItem value="meeting">👥 Meetings</SelectItem>
                      <SelectItem value="deadline">⏰ Deadlines</SelectItem>
                      <SelectItem value="event">🎉 Events</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Reminders list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence>
                  {!selectedDay ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 text-center">
                      <CalendarDays className="w-10 h-10 mb-3" style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a day to view reminders</p>
                    </motion.div>
                  ) : filteredSelected.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: "var(--surface-3)" }}>
                        <Bell className="w-6 h-6" style={{ color: "var(--text-muted)" }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No reminders</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {filterType !== "all" ? "Try a different filter" : "Click + Add to create one"}
                      </p>
                    </motion.div>
                  ) : (
                    filteredSelected.map((reminder, i) => {
                      const cfg = getReminderTypeConfig(reminder.type);
                      const Icon = TYPE_ICONS[reminder.type] ?? Bell;
                      return (
                        <motion.div
                          key={reminder.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-xl p-3 group"
                          style={{
                            background: "var(--surface-2)",
                            border: `1px solid ${reminder.completed ? "var(--border)" : cfg.color + "33"}`,
                            opacity: reminder.completed ? 0.7 : 1,
                          }}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => toggleComplete(reminder)}
                              className="mt-0.5 shrink-0 transition"
                              style={{ color: reminder.completed ? cfg.color : "var(--text-muted)" }}
                            >
                              {reminder.completed
                                ? <CheckCircle2 className="w-4 h-4" />
                                : <Circle className="w-4 h-4" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1"
                                  style={{ background: `${cfg.color}22`, color: cfg.color }}
                                >
                                  <Icon className="w-2.5 h-2.5" />{cfg.label}
                                </span>
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  {format(new Date(reminder.date), "h:mm a")}
                                </span>
                              </div>
                              <p
                                className="text-sm font-medium"
                                style={{
                                  color: "var(--text-primary)",
                                  textDecoration: reminder.completed ? "line-through" : "none",
                                }}
                              >
                                {reminder.title}
                              </p>
                              {reminder.description && (
                                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                                  {reminder.description}
                                </p>
                              )}
                              {reminder.note && (
                                <Link
                                  href="/notes"
                                  className="flex items-center gap-1 mt-1.5 text-xs transition"
                                  style={{ color: "var(--primary-light)" }}
                                >
                                  <FileText className="w-3 h-3" />
                                  {reminder.note.title || "Linked Note"}
                                </Link>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => openEdit(reminder)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteReminder(reminder.id)}
                                disabled={deletingId === reminder.id}
                                className="w-6 h-6 rounded-lg flex items-center justify-center transition"
                                style={{ color: "#ef4444" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                              >
                                {deletingId === reminder.id
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Stats footer */}
              {selectedDayReminders.length > 0 && (
                <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{selectedDayReminders.filter((r) => r.completed).length}/{selectedDayReminders.length} completed</span>
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(selectedDayReminders.filter((r) => r.completed).length / selectedDayReminders.length) * 100}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upcoming reminders sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-80 sm:max-w-sm p-0"
          style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)", color: "var(--text-primary)" }}>
          <SheetHeader className="p-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
            <SheetTitle style={{ color: "var(--text-primary)" }}>
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" style={{ color: "var(--primary-light)" }} />
                Upcoming (7 days)
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarCheck className="w-10 h-10 mb-3" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No upcoming reminders</p>
              </div>
            ) : (
              upcomingReminders.map((reminder) => {
                const cfg = getReminderTypeConfig(reminder.type);
                const Icon = TYPE_ICONS[reminder.type] ?? Bell;
                return (
                  <div key={reminder.id} className="rounded-xl p-3"
                    style={{ background: "var(--surface-2)", border: `1px solid ${cfg.color}33` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: `${cfg.color}22`, color: cfg.color }}>
                        <Icon className="w-2.5 h-2.5" />{cfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{reminder.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {format(new Date(reminder.date), "EEE, MMM d · h:mm a")}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Reminder create/edit dialog */}
      <ReminderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDay ?? new Date()}
        editReminder={editReminder}
      />
    </TooltipProvider>
  );
}
