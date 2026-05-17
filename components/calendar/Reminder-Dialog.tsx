"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRemindersStore, REMINDER_TYPES, type Reminder } from "@/store/use-reminders-store";
import { useNotesStore } from "@/store/use-notes-store";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  editReminder?: Reminder | null;
}

export function ReminderDialog({ open, onOpenChange, defaultDate, editReminder }: ReminderDialogProps) {
  const { addReminder, updateReminder } = useRemindersStore();
  const { notes } = useNotesStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(defaultDate ?? new Date());
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState<string>("reminder");
  const [noteId, setNoteId] = useState<string>("none");
  const [calOpen, setCalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editReminder;

  useEffect(() => {
    if (editReminder) {
      setTitle(editReminder.title);
      setDescription(editReminder.description ?? "");
      const d = new Date(editReminder.date);
      setDate(d);
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setType(editReminder.type);
      setNoteId(editReminder.noteId ?? "none");
    } else {
      setTitle("");
      setDescription("");
      setDate(defaultDate ?? new Date());
      setTime("09:00");
      setType("reminder");
      setNoteId("none");
    }
  }, [editReminder, defaultDate, open]);

  async function handleSave() {
    if (!title.trim()) { toast.error("Title is required"); return; }

    const [h, m] = time.split(":").map(Number);
    const finalDate = new Date(date);
    finalDate.setHours(h, m, 0, 0);

    const typeConfig = REMINDER_TYPES.find((t) => t.value === type);

    try {
      setSaving(true);
      if (isEdit && editReminder) {
        const res = await axios.patch(`/api/reminders/${editReminder.id}`, {
          title: title.trim(),
          description: description.trim() || null,
          date: finalDate.toISOString(),
          type,
          color: typeConfig?.color ?? "#7c3aed",
          noteId: noteId === "none" ? null : noteId,
        });
        updateReminder(editReminder.id, res.data);
        toast.success("Reminder updated");
      } else {
        const res = await axios.post("/api/reminders", {
          title: title.trim(),
          description: description.trim() || null,
          date: finalDate.toISOString(),
          type,
          color: typeConfig?.color ?? "#7c3aed",
          noteId: noteId === "none" ? null : noteId,
        });
        addReminder(res.data);
        toast.success("Reminder created");
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save reminder");
    } finally {
      setSaving(false);
    }
  }

  const selectedType = REMINDER_TYPES.find((t) => t.value === type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--text-primary)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text-primary)" }}>
            {isEdit ? "Edit Reminder" : "New Reminder"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2 flex-wrap">
            {REMINDER_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={type === t.value
                  ? { background: t.color, color: "#fff", boxShadow: `0 2px 8px ${t.color}55` }
                  : { background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <Separator style={{ background: "var(--border)" }} />

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${selectedType?.emoji} ${selectedType?.label} title...`}
              className="rounded-xl border-0 text-sm"
              style={{ background: "var(--surface-3)", color: "var(--text-primary)" }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="rounded-xl border-0 text-sm resize-none"
              style={{ background: "var(--surface-3)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Date</label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-full h-9 px-3 rounded-xl text-sm flex items-center gap-2 transition"
                    style={{ background: "var(--surface-3)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="truncate">{format(date, "MMM d, yyyy")}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { if (d) { setDate(d); setCalOpen(false); } }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          {/* Link to note */}
          {notes.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Link to Note (optional)</label>
              <Select value={noteId} onValueChange={setNoteId}>
                <SelectTrigger
                  className="w-full rounded-xl border-0 text-sm h-9"
                  style={{ background: "var(--surface-3)", color: "var(--text-primary)" }}
                >
                  <SelectValue placeholder="Select a note..." />
                </SelectTrigger>
                <SelectContent style={{ background: "var(--popover)", borderColor: "var(--border)" }}>
                  <SelectItem value="none">No linked note</SelectItem>
                  {notes.slice(0, 20).map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.title || "Untitled Note"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="rounded-xl border-0 hover:opacity-90"
            style={{ background: selectedType?.color ?? "var(--primary)", color: "#fff" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isEdit ? "Save Changes" : "Create Reminder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
