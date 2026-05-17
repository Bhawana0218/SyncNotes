"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, ArchiveRestore, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  summary?: string;
}

export default function ArchivePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchArchived = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/notes?archived=true");
      setNotes(res.data || []);
    } catch {
      toast.error("Failed to load archived notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  async function restoreNote(id: string) {
    setRestoring(id);
    try {
      await axios.patch(`/api/notes/${id}`, { archived: false });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note restored successfully");
    } catch {
      toast.error("Failed to restore note");
    } finally {
      setRestoring(null);
    }
  }

  async function deleteNote(id: string) {
    setDeleting(id);
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note permanently deleted");
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2 mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <Archive className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Archive</h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              {notes.length} archived {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 animate-pulse"
            >
              <div className="h-5 bg-zinc-800 rounded-xl w-3/4 mb-3" />
              <div className="h-4 bg-zinc-800 rounded-xl w-full mb-2" />
              <div className="h-4 bg-zinc-800 rounded-xl w-2/3" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-24 h-24 rounded-3xl bg-zinc-900 flex items-center justify-center mb-6">
            <Archive className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white">Archive is empty</h2>
          <p className="text-zinc-500 mt-2 max-w-sm">
            Notes you archive will appear here. Archive notes from the notes workspace.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-3xl border border-zinc-900 bg-zinc-950/50 p-6 hover:border-zinc-700 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-zinc-500" />
                  </div>
                  <span className="text-xs text-zinc-600">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {note.title || "Untitled Note"}
                </h3>

                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">
                  {note.content?.replace(/<[^>]*>/g, "") || "Empty note"}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-900">
                  <Button
                    onClick={() => restoreNote(note.id)}
                    disabled={restoring === note.id}
                    className="flex-1 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm flex items-center justify-center gap-2"
                  >
                    {restoring === note.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArchiveRestore className="w-4 h-4" />
                    )}
                    Restore
                  </Button>
                  <Button
                    onClick={() => deleteNote(note.id)}
                    disabled={deleting === note.id}
                    className="h-9 w-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center p-0"
                  >
                    {deleting === note.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
