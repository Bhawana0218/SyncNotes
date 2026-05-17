import { create } from "zustand";

export interface Reminder {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  type: "reminder" | "meeting" | "deadline" | "event";
  color: string;
  completed: boolean;
  noteId?: string | null;
  note?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface RemindersStore {
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  removeReminder: (id: string) => void;
}

export const useRemindersStore = create<RemindersStore>((set) => ({
  reminders: [],

  setReminders: (reminders) => set({ reminders }),

  addReminder: (reminder) =>
    set((state) => ({ reminders: [reminder, ...state.reminders] })),

  updateReminder: (id, data) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),

  removeReminder: (id) =>
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),
}));

export const REMINDER_TYPES = [
  { value: "reminder", label: "Reminder", color: "#7c3aed", emoji: "🔔" },
  { value: "meeting",  label: "Meeting",  color: "#0ea5e9", emoji: "👥" },
  { value: "deadline", label: "Deadline", color: "#ef4444", emoji: "⏰" },
  { value: "event",    label: "Event",    color: "#22c55e", emoji: "🎉" },
] as const;

export function getReminderTypeConfig(type: string) {
  return REMINDER_TYPES.find((t) => t.value === type) ?? REMINDER_TYPES[0];
}
