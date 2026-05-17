"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Search, Tag, X, Archive, Loader2, SortAsc } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotesStore } from "@/store/use-notes-store";
import { toast } from "sonner";

interface Note {
  id: string; title: string; content: string;
  tags: string[]; summary?: string; createdAt?: string; updatedAt?: string;
}

export function NotesSidebar() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const { notes, setNotes, activeNote, setActiveNote } = useNotesStore();

  const fetchNotes = useCallback(async (searchVal: string, tagVal: string | null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchVal) params.set("search", searchVal);
      if (tagVal) params.set("tag", tagVal);
      const res = await axios.get(`/api/notes?${params.toString()}`);
      const fetched: Note[] = res.data || [];
      setNotes(fetched);
      const tags = Array.from(new Set(fetched.flatMap((n) => n.tags)));
      setAllTags((prev) => Array.from(new Set([...prev, ...tags])));
      if (fetched.length > 0 && !activeNote) setActiveNote(fetched[0]);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNotes, setActiveNote]);

  useEffect(() => { fetchNotes("", null); }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => fetchNotes(search, selectedTag), 300);
    return () => clearTimeout(t);
  }, [search, selectedTag]); // eslint-disable-line

  const createNote = async () => {
    try {
      setCreating(true);
      const res = await axios.post("/api/notes");
      setNotes([res.data, ...notes]);
      setActiveNote(res.data);
    } catch { toast.error("Failed to create note"); }
    finally { setCreating(false); }
  };

  const filteredNotes = notes.filter((n: Note) => {
    const ms = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const mt = !selectedTag || n.tags.includes(selectedTag);
    return ms && mt;
  });

  return (
    <aside className="w-72 md:w-80 flex flex-col shrink-0 border-r"
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>

      {/* Header */}
      <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--sidebar-border)" }}>
        <button
          onClick={createNote} disabled={creating}
          className="w-full h-10 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm transition hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Note
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl pl-9 pr-8 text-sm outline-none"
            style={{
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5"
              style={{ color: "var(--text-muted)" }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.slice(0, 6).map((tag) => (
              <button key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition"
                style={selectedTag === tag
                  ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                  : { background: "var(--surface-3)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                <Tag className="w-2.5 h-2.5" />{tag}
              </button>
            ))}
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)}
                className="px-2 py-1 rounded-full text-xs flex items-center gap-1"
                style={{ color: "var(--text-muted)" }}>
                <X className="w-2.5 h-2.5" />Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
        </span>
        <SortAsc className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {loading ? (
          <div className="space-y-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="h-3.5 rounded w-3/4 mb-2" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 rounded w-full mb-1" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 rounded w-1/2" style={{ background: "var(--surface-3)" }} />
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <AnimatePresence>
            {filteredNotes.map((note: Note, i) => {
              const isActive = activeNote?.id === note.id;
              return (
                <motion.button key={note.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  onClick={() => setActiveNote(note)}
                  className="w-full text-left p-3.5 rounded-xl flex flex-col items-start transition-all duration-200"
                  style={isActive
                    ? { background: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "0 2px 12px rgba(124,58,237,0.25)" }
                    : { background: "var(--surface-2)", border: "1px solid var(--border)" }
                  }
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <h3 className="font-semibold text-sm truncate flex-1"
                      style={{ color: isActive ? "var(--primary-foreground)" : "var(--text-primary)" }}>
                      {note.title || "Untitled Note"}
                    </h3>
                    {note.summary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold"
                        style={isActive
                          ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                          : { background: "var(--accent)", color: "var(--primary-light)" }
                        }>AI</span>
                    )}
                  </div>

                  <p className="text-xs mt-1.5 line-clamp-2 w-full"
                    style={{ color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}>
                    {note.content?.replace(/<[^>]*>/g, "") || "Empty note"}
                  </p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={isActive
                            ? { background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }
                            : { background: "var(--surface-3)", color: "var(--text-secondary)" }
                          }>#{tag}</span>
                      ))}
                    </div>
                  )}

                  {note.updatedAt && (
                    <p className="text-[10px] mt-2"
                      style={{ color: isActive ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}>
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--surface-3)" }}>
              {search || selectedTag
                ? <Search className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
                : <FileText className="w-7 h-7" style={{ color: "var(--text-muted)" }} />}
            </div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {search || selectedTag ? "No results" : "No notes yet"}
            </h3>
            <p className="text-xs mt-1 max-w-[160px]" style={{ color: "var(--text-muted)" }}>
              {search || selectedTag ? "Try a different search" : "Create your first AI-powered note"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Archive link */}
      <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
        <a href="/archive"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <Archive className="w-4 h-4" />View Archive
        </a>
      </div>
    </aside>
  );
}
