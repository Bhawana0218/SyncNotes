"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Tag,
  X,
  Archive,
  Loader2,
  SortAsc,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotesStore } from "@/store/use-notes-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
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
      const fetchedNotes: Note[] = res.data || [];
      setNotes(fetchedNotes);

      // Collect all unique tags from all notes (no filter applied)
      const tags = Array.from(new Set(fetchedNotes.flatMap((n) => n.tags)));
      setAllTags((prev) => Array.from(new Set([...prev, ...tags])));

      if (fetchedNotes.length > 0 && !activeNote) {
        setActiveNote(fetchedNotes[0]);
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNotes, setActiveNote]);

  // Initial load
  useEffect(() => {
    fetchNotes("", null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search/filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchNotes(search, selectedTag);
    }, 300);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedTag]);

  const createNote = async () => {
    try {
      setCreating(true);
      const res = await axios.post("/api/notes");
      const newNote: Note = res.data;
      setNotes([newNote, ...notes]);
      setActiveNote(newNote);
    } catch {
      toast.error("Failed to create note");
    } finally {
      setCreating(false);
    }
  };

  // Client-side filter (for instant feedback while debounce runs)
  const filteredNotes = notes.filter((note: Note) => {
    const matchesSearch =
      !search ||
      note.title?.toLowerCase().includes(search.toLowerCase()) ||
      note.content?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <aside className="w-72 md:w-80 border-r border-zinc-900 bg-zinc-950/50 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 space-y-3">
        <Button
          onClick={createNote}
          disabled={creating}
          className="w-full h-11 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Note
        </Button>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl bg-zinc-900 border border-zinc-800 pl-10 pr-4 text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                  selectedTag === tag
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2.5 py-1 rounded-full text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                <X className="w-2.5 h-2.5" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notes count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-zinc-600">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
        </span>
        <SortAsc className="w-3.5 h-3.5 text-zinc-700" />
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5">
        {loading ? (
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-4 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-full mb-1" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <AnimatePresence>
            {filteredNotes.map((note: Note, i) => (
              <motion.button
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => setActiveNote(note)}
                className={`w-full text-left p-4 rounded-2xl border flex flex-col items-start transition-all duration-200 ${
                  activeNote?.id === note.id
                    ? "bg-white text-black border-white"
                    : "bg-zinc-950 border-zinc-900 hover:border-zinc-700 text-white"
                }`}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <h3 className="font-semibold text-sm truncate flex-1">
                    {note.title || "Untitled Note"}
                  </h3>
                  {note.summary && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                        activeNote?.id === note.id
                          ? "bg-black/10 text-black"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      AI
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-1.5 line-clamp-2 w-full break-words ${
                    activeNote?.id === note.id ? "text-black/60" : "text-zinc-500"
                  }`}
                >
                  {note.content?.replace(/<[^>]*>/g, "") || "Empty note"}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          activeNote?.id === note.id
                            ? "bg-black/10 text-black"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {note.updatedAt && (
                  <p
                    className={`text-xs mt-2 ${
                      activeNote?.id === note.id ? "text-black/40" : "text-zinc-700"
                    }`}
                  >
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center mb-4">
              {search || selectedTag ? (
                <Search className="w-8 h-8 text-zinc-600" />
              ) : (
                <FileText className="w-8 h-8 text-zinc-600" />
              )}
            </div>
            <h3 className="text-base font-semibold text-white">
              {search || selectedTag ? "No results found" : "No notes yet"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-[180px]">
              {search || selectedTag
                ? "Try a different search or filter"
                : "Create your first AI-powered note"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Archive link */}
      <div className="p-3 border-t border-zinc-900">
        <a
          href="/archive"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition text-sm"
        >
          <Archive className="w-4 h-4" />
          View Archive
        </a>
      </div>
    </aside>
  );
}
