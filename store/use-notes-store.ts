import { create } from "zustand";

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  actionItems?: string;
  tags: string[];
  archived?: boolean;
  isPublic?: boolean;
  shareId?: string;
  createdAt?: string;
  updatedAt?: string;
  isGenerating?: boolean;
}

interface NotesStore {
  notes: Note[];
  activeNote: Note | null;
  setNotes: (notes: Note[]) => void;
  setActiveNote: (note: Note | null) => void;
  updateActiveNote: (data: Partial<Note>) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  removeNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  notes: [],
  activeNote: null,

  setNotes: (notes) => set({ notes }),

  setActiveNote: (note) => set({ activeNote: note }),

  updateActiveNote: (data) =>
    set((state) => ({
      activeNote: state.activeNote ? { ...state.activeNote, ...data } : null,
      // Also sync to notes list
      notes: state.activeNote
        ? state.notes.map((n) =>
            n.id === state.activeNote!.id ? { ...n, ...data } : n
          )
        : state.notes,
    })),

  updateNote: (id, data) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
      activeNote:
        state.activeNote?.id === id
          ? { ...state.activeNote, ...data }
          : state.activeNote,
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      activeNote: state.activeNote?.id === id ? null : state.activeNote,
    })),
}));
