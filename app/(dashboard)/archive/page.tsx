"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  Loader2,
  Search,
  Clock,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  summary?: string;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: "var(--surface-3)" }} />
        <div className="w-20 h-3 rounded" style={{ background: "var(--surface-3)" }} />
      </div>
      <div className="w-3/4 h-4 rounded mb-2" style={{ background: "var(--surface-3)" }} />
      <div className="w-full h-3 rounded mb-1.5" style={{ background: "var(--surface-3)" }} />
      <div className="w-2/3 h-3 rounded mb-4" style={{ background: "var(--surface-3)" }} />
      <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex-1 h-8 rounded-xl" style={{ background: "var(--surface-3)" }} />
        <div className="w-8 h-8 rounded-xl" style={{ background: "var(--surface-3)" }} />
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  useEffect(() => { fetchArchived(); }, [fetchArchived]);

  async function restoreNote(id: string) {
    setRestoring(id);
    try {
      await axios.patch(`/api/notes/${id}`, { archived: false });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note restored to workspace");
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
      setConfirmDelete(null);
      toast.success("Note permanently deleted");
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleting(null);
    }
  }

  const filtered = notes.filter((n) =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.replace(/<[^>]*>/g, "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-full"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)" }}
              >
                <Archive className="w-6 h-6" style={{ color: "var(--primary-light)" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Archive
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {loading ? "Loading…" : `${notes.length} archived ${notes.length === 1 ? "note" : "notes"}`}
                </p>
              </div>
            </div>

            {/* Search */}
            {!loading && notes.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3 top-2.5 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search archived notes…"
                  className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Info banner */}
          {!loading && notes.length > 0 && (
            <div
              className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "var(--accent)",
                border: "1px solid var(--border)",
                color: "var(--accent-foreground)",
              }}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--primary-light)" }} />
              Archived notes are hidden from your workspace. Restore them to make them active again.
            </div>
          )}
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : notes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <Archive className="w-10 h-10" style={{ color: "var(--text-muted)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Archive is empty
            </h2>
            <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
              Notes you archive from the workspace will appear here. You can restore or permanently delete them.
            </p>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Search className="w-10 h-10 mb-4" style={{ color: "var(--text-muted)" }} />
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>No results for "{search}"</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Try a different search term</p>
          </motion.div>

        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filtered.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="rounded-2xl p-5 flex flex-col group transition-all duration-200"
                  style={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      <FileText className="w-5 h-5" style={{ color: "var(--primary-light)" }} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="font-semibold text-base mb-1.5 line-clamp-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {note.title || "Untitled Note"}
                  </h3>

                  {/* Preview */}
                  <p
                    className="text-sm line-clamp-2 mb-3 flex-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {note.content?.replace(/<[^>]*>/g, "").trim() || "No content"}
                  </p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: "var(--accent)",
                            color: "var(--primary-light)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "var(--surface-3)", color: "var(--text-muted)" }}
                        >
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI badge */}
                  {note.summary && (
                    <div className="mb-3">
                      <span className="badge-ai px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        AI Enhanced
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 pt-3 mt-auto"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {confirmDelete === note.id ? (
                      /* Confirm delete state */
                      <div className="flex items-center gap-2 w-full">
                        <p className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
                          Permanently delete?
                        </p>
                        <button
                          onClick={() => deleteNote(note.id)}
                          disabled={deleting === note.id}
                          className="h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                          style={{ background: "#ef4444", color: "#fff" }}
                        >
                          {deleting === note.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="h-8 px-3 rounded-xl text-xs font-medium transition"
                          style={{ background: "var(--surface-3)", color: "var(--text-secondary)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => restoreNote(note.id)}
                          disabled={restoring === note.id}
                          className="flex-1 h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition hover:opacity-90"
                          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                        >
                          {restoring === note.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ArchiveRestore className="w-4 h-4" />}
                          Restore
                        </button>
                        <button
                          onClick={() => setConfirmDelete(note.id)}
                          className="h-9 w-9 rounded-xl flex items-center justify-center transition"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.2)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
