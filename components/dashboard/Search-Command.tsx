"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FileText, Sparkles, Search, Plus, LayoutDashboard, Archive, Settings, CalendarDays } from "lucide-react";
import { useNotesStore } from "@/store/use-notes-store";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary?: string;
}

export function SearchCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Note[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { setActiveNote } = useNotesStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/notes?search=${encodeURIComponent(query)}`);
        setResults(res.data?.slice(0, 8) || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handleSelectNote(note: Note) {
    setActiveNote(note);
    router.push("/notes");
    setOpen(false);
    setQuery("");
  }

  async function handleCreateNote() {
    try {
      const res = await axios.post("/api/notes");
      setActiveNote(res.data);
      router.push("/notes");
      setOpen(false);
    } catch {
      // ignore
    }
  }

  const pages = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Notes", href: "/notes", icon: FileText },
    { label: "Calendar", href: "/calendar", icon: CalendarDays },
    { label: "Archive", href: "/archive", icon: Archive },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition text-zinc-400 text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search notes...</span>
        <div className="hidden sm:flex items-center gap-0.5 text-xs text-zinc-600 ml-2">
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono">K</kbd>
        </div>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search notes, navigate pages..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm text-zinc-500">Searching...</div>
          ) : (
            <>
              <CommandEmpty>
                {query ? "No notes found." : "Type to search your notes."}
              </CommandEmpty>

              {results.length > 0 && (
                <CommandGroup heading="Notes">
                  {results.map((note) => (
                    <CommandItem
                      key={note.id}
                      onSelect={() => handleSelectNote(note)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
                        {note.tags.length > 0 && (
                          <p className="text-xs text-zinc-500 truncate">
                            {note.tags.map((t) => `#${t}`).join(" ")}
                          </p>
                        )}
                      </div>
                      {note.summary && (
                        <Sparkles className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandGroup heading="Quick Actions">
                <CommandItem onSelect={handleCreateNote} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Note
                </CommandItem>
              </CommandGroup>

              {!query && (
                <CommandGroup heading="Navigate">
                  {pages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <CommandItem
                        key={page.href}
                        onSelect={() => {
                          router.push(page.href);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {page.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
